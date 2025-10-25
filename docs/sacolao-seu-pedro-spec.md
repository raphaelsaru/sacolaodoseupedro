# Sacolão do Seu Pedro — MVP Tech Spec (Cursor-Ready)

> Objetivo: entregar um sistema funcional, simples e direto ao ponto para operação de um sacolão (hortifruti) — com catálogo, pedidos, entregas e um fluxo de checkout por WhatsApp. Stack enxuta: **Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase (DB, Auth, Storage)**. Sem banco local, sem complicações de infra. Autenticação via **Supabase Auth**.

---

## 1) Escopo & Diretrizes

- **Canal de venda**: cardápio/catálogos com carrinho; checkout dispara **mensagem no WhatsApp** com o resumo do pedido.
- **Operação interna**: painel com pedidos do dia, status (novo → separado → saiu para entrega → entregue), controle simples de preços/estoque, cadastro básico de clientes e endereços.
- **Pagamentos**: registro manual de método (Pix, dinheiro, cartão na retirada). MVP não precisa gateway online (liquidação manual).
- **Visual**: **shadcn/ui**, mobile-first, escuro/claro, componentes de tabela, formulário, sheet/drawer e toast.
- **Dados**: apenas **Supabase** (Postgres + RLS), **Auth** do Supabase, **Storage** para imagens de produtos.
- **WhatsApp**: CTA `wa.me/<numero>?text=<resumo>` no checkout; número **dedicado da loja** 



---

## 2) Personas (MVP)

- **Admin (Seu Pedro / Gerente)**: gerencia catálogo, preços, promoções/cestas, usuários.
- **Cliente (Público)**: acessa cardápio público e envia pedido pelo WhatsApp (sem login).

---

## 3) Principais Funcionalidades

### 3.1 Público (sem login)
- **Catálogo** com busca e filtros (categorias e unidade: kg, unidade, maço, bandeja).
- **Carrinho** com quantidades (decimais para produtos por kg).
- **Checkout por WhatsApp**: gera mensagem pré-formatada com: itens, quantidades, subtotais, total, nome/telefone, método de pagamento desejado, observações.
- **Cestas/Combos**: itens pré-montados (Ex.: “Cesta da Semana”).

### 3.2 Painel Interno (com login)
- **Dashboard**: pedidos do dia, total do dia/semana, top vendidos.
- **Pedidos**: lista de todos os pedidos e opcão pra ver cada pedido indivualizado.
- **Produtos**: CRUD (nome, foto, unidade, preço atual, ativo/inativo). Movimentação simples de estoque.
- **Clientes**: CRUD básico (nome, telefone, endereços).
- **Promoções/Cestas**: CRUD de cestas e seus itens.

---

## 4) Stack & Padrões

- **Front**: Next.js (App Router), TypeScript, Tailwind CSS, **shadcn/ui**.
- **State/Data**: Server Components + `@supabase/ssr`.
- **Auth**: Supabase Auth (email/senha; sem provedores sociais no MVP).
- **DB**: Supabase Postgres + RLS. Storage para imagens.
- **Infra**: Deploy em Vercel + Supabase Cloud. Sem workers externos no MVP.

---

## 5) Modelo de Dados (Supabase)

> Prefixo `id` sempre UUID. Campos `created_at`, `updated_at` com default/trigger. Índices nos campos de busca/join.

### 5.1 Tabelas

**`profiles`** (metadados do usuário do Auth)
- `id` (uuid, pk, = auth.uid)
- `role` (enum: admin|staff)
- `full_name` (text)
- `phone` (text)
- `created_at`, `updated_at`

**`categories`**
- `id`
- `name` (text, unique)
- `position` (int)

**`units`**
- `id`
- `name` (text) — ex.: "kg", "un", "maço", "bandeja"
- `step` (numeric) — ex.: 0.1 para kg

**`products`**
- `id`
- `name` (text)
- `category_id` (fk categories)
- `unit_id` (fk units)
- `price` (numeric(12,2)) — preço atual
- `sku` (text, opcional)
- `image_url` (text, Storage)
- `is_active` (bool, default true)

**`baskets`**
- `id`
- `name` (text)
- `description` (text)
- `price` (numeric(12,2)) — preço fechado do combo
- `image_url` (text)
- `is_active` (bool)

**`basket_items`**
- `id`
- `basket_id` (fk baskets)
- `product_id` (fk products)
- `qty` (numeric(12,3)) — quantidades podem ser decimais

**`customers`**
- `id`
- `full_name` (text)
- `phone` (text, unique)
- `email` (text, opcional)
- `notes` (text)

**`addresses`**
- `id`
- `customer_id` (fk customers)
- `label` (text) — Casa, Trabalho
- `street` (text)
- `number` (text)
- `complement` (text)
- `neighborhood` (text)
- `city` (text)
- `state` (text)
- `zip` (text)
- `is_default` (bool)


**`orders`**
- `id`
- `customer_id` (fk customers, nullable para pedidos walk-in)
- `address_id` (fk addresses, nullable)
- `status` (enum: new|picking|out_for_delivery|delivered|canceled)
- `subtotal` (numeric(12,2))
- `discount` (numeric(12,2))
- `total` (numeric(12,2))
- `payment_method` (enum: pix|cash|card_on_delivery|other)
- `paid` (bool, default false)
- `channel` (enum: whatsapp|counter|web)
- `notes` (text)
- `placed_at` (timestamptz)

**`order_items`**
- `id`
- `order_id` (fk orders)
- `product_id` (fk products, nullable se for item livre)
- `name` (text) — snapshot do nome
- `unit_id` (fk units)
- `qty` (numeric(12,3))
- `unit_price` (numeric(12,2))
- `total` (numeric(12,2))

**`inventory_moves`** (opcional MVP)
- `id`
- `product_id` (fk products)
- `type` (enum: in|out|adjust)
- `qty` (numeric(12,3))
- `note` (text)


### 5.2 RLS (Resumo)
- `profiles`: usuário só enxerga/edita seu próprio registro. Admins podem listar.
- `products`, `baskets`: leitura liberada para `role in ('admin','staff')`. Público acessa via rota pública (SSR) sem expor diretamente a tabela (ou `anon` com policy READ-only).
- `orders`, `order_items`, `customers`, `addresses`: somente `admin/staff`.
- Políticas explícitas com checagem de `auth.uid()` e `profiles.role`.

---

## 6) Fluxos Principais

### 6.1 Checkout (Público → WhatsApp)
1) Usuário adiciona itens (produtos e/ou cesta) ao carrinho.
2) Informa nome, telefone, obs.
3) Exibe total.
4) Botão **“Finalizar no WhatsApp”** monta `text` com o resumo do pedido + dados.
5) Abre `wa.me/<numero_da_loja>?text=<mensagem>` no WhatsApp do cliente.
6) Atendente recebe no WhatsApp Business e cria/atualiza o **Pedido** no painel.


---

## 7) UI/UX (shadcn/ui)

### 7.1 Público
- `/menu` — grid com cards de produto (imagem, nome, unidade, preço, botão “+”).
- `/cart` — itens, editar quantidades, método pagamento, resumo total, botão **“Finalizar no WhatsApp”**.
- `/cestas` — vitrine de combos (cards).

### 7.2 Interno
- `/login` — Supabase Auth; lembrar-me.
- `/app` (Dashboard) — KPIs do dia + últimos pedidos.
- `/app/pedidos` — tabela
- `/app/pedidos/:id` — detalhes, imprimir picking list/comprovante.
- `/app/produtos` — CRUD com upload (Storage) e `is_active`.
- `/app/clientes` — CRUD + endereços.
- `/app/cestas` — CRUD de cestas e itens.

**Componentes shadcn sugeridos**: `Button`, `Input`, `Label`, `Textarea`, `Select`, `Dialog`, `Sheet`, `Drawer`, `Card`, `Table`, `Badge`, `Tabs`, `Toast`, `DropdownMenu`, `Form` com Zod.

---

## 8) Rotas & Server Actions (Next.js)

> Preferir **Server Actions** e `@supabase/ssr` para operações autenticadas no servidor.

- **GET** público (SSR): `menu`, `cestas` (lê via service com policies de leitura/anon).
- **POST** server actions:
  - `createOrder(input)` — cria pedido + itens;.
  - `updateOrderStatus(id, status)`
  - `createProduct`, `updateProduct`, `toggleProductActive`
  - `createBasket`, `updateBasket`, `setBasketItems`
  - `createCustomer`, `updateCustomer`

---

## 9) Integração WhatsApp (MVP e Futuro)

- **MVP**: apenas link `wa.me`. O atendente confirma e cadastra pedido.

---

## 10) Variáveis de Ambiente

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE= # apenas no servidor (Vercel)
SUPABASE_BUCKET_IMAGES=products

# App
APP_NAME=Sacolao do Seu Pedro
WHATSAPP_NUMBER=55XXXXXXXXXXX  # E.164, usado no wa.me
DEFAULT_CITY=Planaltina
DEFAULT_STATE=DF
```

---

## 11) Seeds (Exemplo)

- `units`: kg (step 0.1), un (1), maço (1), bandeja (1)
- `categories`: Frutas, Verduras, Legumes, Grãos, Laticínios, Outros
- `products`: Banana (kg, 7.99), Tomate (kg, 8.49), Alface (maço, 4.99), Ovo (bandeja 30, 24.90)…

---

## 12) Segurança & RLS

- Usar `supabase.auth.getUser()` no servidor para autenticação confiável.
- RLS: políticas por tabela (ver §5.2). `anon` sem WRITE.
- Upload de imagens: regra de Storage por pasta `products/*` com leitura pública e escrita apenas por `role in ('admin','staff')`.

---


## 15) Definição de Pronto (DoD)

- Fluxo público completo até abrir WhatsApp com resumo correto.
- CRUD de produtos estável com imagens.
- Pedidos internalizados no painel e atualizáveis de status.
- RLS configurado, e2e smoke test (criar pedido; ver no painel).
- Deploy Vercel + Supabase com `.env` documentado.

---

## 16) Anexos & Observações
- Ícones/cores: adotar visual “feira fresca” com paleta verde neutra; usar shadcn inicialmente.

