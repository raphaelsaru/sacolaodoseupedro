# 🥬 Sacolão do Seu Pedro

Sistema completo de catálogo online e gestão para hortifruti com integração WhatsApp.

## 🚀 Funcionalidades

### Área Pública
- ✅ Catálogo de produtos com busca e filtros
- ✅ Carrinho de compras com quantidades decimais (kg)
- ✅ Cestas especiais pré-montadas
- ✅ Checkout via WhatsApp (sem necessidade de login)
- ✅ Interface responsiva e moderna

### Painel Administrativo
- ✅ Dashboard com KPIs e métricas de vendas
- ✅ Gerenciamento completo de produtos (CRUD + upload de imagens)
- ✅ Controle de pedidos com atualização de status
- ✅ Cadastro de clientes e endereços
- ✅ Criação de cestas/combos personalizados
- ✅ Autenticação segura via Supabase

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage
- **Gerenciador de Pacotes**: pnpm

## 📋 Pré-requisitos

- Node.js 20+
- pnpm
- Conta no Supabase (gratuita)

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd seupedro
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Supabase (obtenha em: https://supabase.com/dashboard/project/_/settings/api)
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_BUCKET_IMAGES=products

# App
APP_NAME=Sacolão do Seu Pedro
NEXT_PUBLIC_WHATSAPP_NUMBER=5561999999999  # Número no formato E.164
DEFAULT_CITY=Planaltina
DEFAULT_STATE=DF
```

4. **Configure o banco de dados**

O projeto já vem com as migrations aplicadas no Supabase. Caso precise recriar:

- As tabelas, enums e funções estão definidas nas migrations
- Os seeds iniciais (categorias e unidades) já foram inseridos
- O storage bucket para imagens já foi criado

5. **Crie um usuário admin**

Acesse o painel do Supabase:
- Vá em Authentication > Users
- Clique em "Add user" > "Create new user"
- Insira email e senha
- Após criar, vá em Database > Table Editor > profiles
- Insira um registro com:
  - `id`: mesmo UUID do usuário criado
  - `role`: 'admin'
  - `full_name`: Nome do administrador
  - `phone`: Telefone (opcional)

6. **Execute o projeto**
```bash
pnpm dev
```

O projeto estará disponível em `http://localhost:3000`

## 📱 Uso

### Para o Público
1. Acesse `/cardapio` para ver os produtos disponíveis
2. Adicione itens ao carrinho
3. Acesse `/carrinho` e preencha suas informações
4. Clique em "Finalizar no WhatsApp" para enviar o pedido

### Para Administradores
1. Acesse `/login` e faça login com suas credenciais
2. O painel admin estará disponível em `/app`
3. Gerencie produtos, pedidos, clientes e cestas

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── (public)/          # Rotas públicas
│   │   ├── cardapio/      # Catálogo de produtos
│   │   ├── cestas/        # Cestas especiais
│   │   └── carrinho/      # Carrinho e checkout
│   ├── app/               # Rotas administrativas
│   │   ├── pedidos/       # Gerenciamento de pedidos
│   │   ├── produtos/      # CRUD de produtos
│   │   ├── clientes/      # Cadastro de clientes
│   │   └── cestas/        # Gerenciamento de cestas
│   └── login/             # Autenticação
├── components/            # Componentes React
│   ├── ui/               # Componentes do shadcn/ui
│   └── ...               # Componentes customizados
├── contexts/             # Contextos React (carrinho)
├── lib/
│   ├── actions/          # Server Actions
│   ├── supabase/         # Configuração do Supabase
│   └── types/            # TypeScript types
└── middleware.ts         # Middleware de autenticação
```

## 🗄️ Modelo de Dados

- **profiles**: Usuários do sistema (admin/staff)
- **categories**: Categorias de produtos
- **units**: Unidades de medida (kg, un, maço, etc)
- **products**: Produtos do catálogo
- **baskets**: Cestas/combos especiais
- **basket_items**: Itens das cestas
- **customers**: Clientes
- **addresses**: Endereços dos clientes
- **orders**: Pedidos
- **order_items**: Itens dos pedidos
- **inventory_moves**: Movimentações de estoque (opcional)

## 🔒 Segurança

- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas de acesso baseadas em roles (admin/staff)
- Autenticação via Supabase Auth
- Middleware de proteção de rotas
- Upload de imagens com validação

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Conecte o repositório no Vercel
3. Configure as variáveis de ambiente
4. Deploy automático!

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:
- Netlify
- AWS Amplify
- Digital Ocean
- Railway

## 📝 Próximos Passos Sugeridos

- [ ] Implementar busca avançada com filtros múltiplos
- [ ] Adicionar relatórios de vendas
- [ ] Sistema de notificações (email/SMS)
- [ ] Integração com gateway de pagamento
- [ ] App mobile com React Native
- [ ] Sistema de fidelidade/pontos
- [ ] Controle de estoque automatizado

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido com ❤️ para o Seu Pedro
