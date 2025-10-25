# Implementação de Estoque e Custo dos Produtos

## 📋 Resumo das Alterações

Foi implementado um sistema completo de controle de estoque e custo para os produtos do Sacolão Seu Pedro.

## 🎯 Funcionalidades Implementadas

### 1. Campos Adicionados ao Banco de Dados

- **`quantity`** (DECIMAL 10,2): Quantidade atual em estoque (2 casas decimais)
- **`cost`** (DECIMAL 10,2): Custo do produto (para controle interno de margem)

### 2. Formulário de Produtos (Admin)

**Localização:** `/app/produtos/novo` e `/app/produtos/[id]/editar`

Campos adicionados:
- ✅ **Preço de Venda** (renomeado para clareza)
- ✅ **Custo** - campo obrigatório
- ✅ **Quantidade em Estoque** - campo obrigatório com 2 casas decimais

### 3. Tabela de Produtos (Admin)

**Localização:** `/app/produtos`

Colunas adicionadas:
- ✅ **Custo** - exibido com texto cinza (informação interna)
- ✅ **Estoque** - exibido com badge:
  - 🔴 Badge vermelho quando estoque <= 0
  - 🟢 Badge verde quando tem estoque disponível
  - Mostra quantidade + unidade de medida

### 4. Cardápio Público - Controle de Produtos sem Estoque

**Localização:** `/` (página inicial)

Melhorias implementadas:
- ✅ Card do produto com **opacidade de 50%** quando sem estoque
- ✅ Badge "Fora de estoque" vermelho visível no card
- ✅ Botão "Adicionar" desabilitado e mostra "Indisponível"
- ✅ Botão de incremento (+) desabilitado quando sem estoque
- ✅ Mensagem de erro ao tentar adicionar produto sem estoque
- ✅ **Validação de estoque:** não permite adicionar mais do que a quantidade disponível
- ✅ **Ajuste automático:** se tentar adicionar mais, ajusta para o máximo disponível
- ✅ **Aviso específico:** "Não é possível adicionar mais deste item ao carrinho pois não consta essa quantidade no estoque."

## 📁 Arquivos Modificados

### Backend/Actions
- ✅ `src/lib/actions/products.ts` - Adicionados campos cost e quantity nas funções create e update

### Types
- ✅ `src/lib/types/database.types.ts` - Tipos TypeScript atualizados com novos campos

### Componentes
- ✅ `src/components/product-form.tsx` - Formulário com campos de custo e estoque
- ✅ `src/components/product-card.tsx` - Card com controle visual de produtos sem estoque

### Páginas
- ✅ `src/app/app/produtos/page.tsx` - Tabela admin com colunas de custo e estoque
- ✅ `src/app/(public)/page.tsx` - Passa quantity para o ProductCard

## 🚀 Como Aplicar as Mudanças

### Passo 1: Executar Migration SQL

Acesse o **Supabase SQL Editor** e execute o arquivo:

```bash
docs/migration-add-stock-and-cost.sql
```

Ou copie e execute diretamente:

```sql
ALTER TABLE products
ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2) DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2) DEFAULT 0 NOT NULL;

COMMENT ON COLUMN products.quantity IS 'Quantidade atual em estoque';
COMMENT ON COLUMN products.cost IS 'Custo do produto (para controle interno)';

CREATE INDEX IF NOT EXISTS idx_products_quantity ON products(quantity) WHERE quantity <= 0;
```

### Passo 2: Atualizar Produtos Existentes (Opcional)

Se você já tem produtos cadastrados, é recomendado atualizar os valores:

```sql
-- Definir custo inicial para produtos existentes
UPDATE products SET cost = price * 0.6 WHERE cost = 0;

-- Definir estoque inicial para produtos existentes (exemplo: 100 unidades)
UPDATE products SET quantity = 100 WHERE quantity = 0;
```

### Passo 3: Testar

1. Acesse `/app/produtos` e verifique as novas colunas
2. Crie um novo produto e preencha custo e estoque
3. Zere o estoque de um produto de teste
4. Acesse a página pública (home) e verifique que o produto aparece com opacidade e indisponível

## 💡 Dicas de Uso

### Margem de Lucro

Agora é possível calcular a margem de lucro:

```
Margem = ((Preço - Custo) / Preço) * 100
```

Exemplo:
- Custo: R$ 2,00
- Preço: R$ 5,00
- Margem: 60%

### Gestão de Estoque

- Ao cadastrar produtos, sempre informe a quantidade atual em estoque
- Produtos com estoque zerado aparecem com badge vermelho na tabela admin
- Clientes não conseguem adicionar produtos sem estoque ao carrinho

### Próximas Melhorias Sugeridas

- [ ] Implementar baixa automática de estoque ao finalizar pedido
- [ ] Alertas quando estoque ficar abaixo de um mínimo definido
- [ ] Histórico de movimentações de estoque (já existe tabela inventory_moves)
- [ ] Relatório de produtos mais vendidos
- [ ] Cálculo automático de margem de lucro na interface

## ⚠️ Observações Importantes

1. **Decimal Places:**
   - `quantity` usa 2 casas decimais (0.01) - suficiente para produtos vendidos por kg
   - `cost` usa 2 casas decimais (0.01) para valores monetários

2. **Valores Padrão:**
   - Novos produtos iniciam com quantity = 0 e cost = 0
   - É obrigatório informar esses valores ao cadastrar

3. **Segurança:**
   - O custo só é visível na área administrativa
   - Clientes não têm acesso ao custo dos produtos

4. **Performance:**
   - Foi criado um índice para facilitar consultas de produtos sem estoque
   - A query não afeta a performance da página pública

5. **Validação de Estoque no Carrinho:**
   - O cliente não pode adicionar mais do que o disponível em estoque
   - Se tentar incrementar além do estoque, o sistema ajusta automaticamente para o máximo
   - Uma mensagem clara é exibida explicando a limitação

## ✅ Checklist de Validação

- [x] Migration SQL criada
- [x] Types TypeScript atualizados
- [x] Formulário de produto atualizado
- [x] Actions create/update modificadas
- [x] Tabela admin exibindo estoque e custo
- [x] Card público com opacidade e badge para produtos sem estoque
- [x] Botões desabilitados quando produto sem estoque
- [x] Mensagens de erro apropriadas
- [x] Documentação criada

## 🎉 Conclusão

O sistema de estoque e custo está completamente implementado e pronto para uso! 

Basta executar a migration SQL no Supabase e as alterações estarão funcionando.

