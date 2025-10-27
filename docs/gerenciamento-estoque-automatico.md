# Gerenciamento Automático de Estoque

## Visão Geral

O sistema implementa um gerenciamento **automático e dinâmico de estoque** que:

1. ✅ **Desconta automaticamente** o estoque quando um pedido é criado
2. ✅ **Devolve automaticamente** o estoque quando um pedido é cancelado
3. ✅ **Registra todas as movimentações** na tabela `inventory_moves` para auditoria

## Como Funciona

### 1. Criação de Pedido (Desconto de Estoque)

Quando um cliente faz um pedido através do cardápio web:

```typescript
// Fluxo automático:
1. Pedido é criado → createOrder()
2. Itens do pedido são salvos
3. Para cada item com product_id:
   - Verifica estoque disponível
   - Desconta quantidade do estoque
   - Registra movimentação tipo "out"
```

**Exemplo:**
- Cliente compra 2kg de Tomate
- Estoque atual: 50kg
- Estoque após pedido: 48kg
- Registro: Movimentação "out" de 2kg com nota "Pedido #abc123 criado"

### 2. Cancelamento de Pedido (Devolução de Estoque)

Quando um admin cancela um pedido:

```typescript
// Fluxo automático:
1. Status muda para "canceled" → updateOrderStatus()
2. Sistema verifica se status anterior não era "canceled"
3. Se sim, para cada item com product_id:
   - Adiciona quantidade de volta ao estoque
   - Registra movimentação tipo "in"
```

**Exemplo:**
- Admin cancela pedido de 2kg de Tomate
- Estoque atual: 48kg
- Estoque após cancelamento: 50kg
- Registro: Movimentação "in" de 2kg com nota "Pedido #abc123 cancelado - devolução de estoque"

## Funções Principais

### decrementProductStock()

```typescript
/**
 * Decrementa o estoque de um produto e registra a movimentação
 */
export async function decrementProductStock(
  productId: string,
  quantity: number,
  note?: string
)
```

**Validações:**
- ✅ Verifica se o produto existe
- ✅ Verifica se há estoque suficiente
- ✅ Atualiza o campo `quantity` na tabela `products`
- ✅ Registra movimentação tipo `out` em `inventory_moves`

### incrementProductStock()

```typescript
/**
 * Incrementa o estoque de um produto e registra a movimentação
 */
export async function incrementProductStock(
  productId: string,
  quantity: number,
  note?: string
)
```

**Operações:**
- ✅ Adiciona quantidade ao estoque
- ✅ Atualiza o campo `quantity` na tabela `products`
- ✅ Registra movimentação tipo `in` em `inventory_moves`

## Rastreabilidade

Todas as movimentações de estoque são registradas na tabela `inventory_moves` com:

| Campo | Descrição |
|-------|-----------|
| `id` | ID único da movimentação |
| `product_id` | Produto afetado |
| `type` | Tipo: `in` (entrada), `out` (saída), `adjust` (ajuste) |
| `qty` | Quantidade movimentada |
| `note` | Nota explicativa (ex: "Pedido #abc123 criado") |
| `created_at` | Data e hora da movimentação |

## Fluxos Especiais

### Produtos vs Cestas

- **Produtos** (`product_id` preenchido): Estoque é gerenciado automaticamente
- **Cestas** (`product_id` é null): Não afetam estoque diretamente

### Múltiplos Itens no Pedido

O sistema processa cada item individualmente:

```typescript
// Pedido com 3 produtos diferentes
for (const item of orderData.items) {
  if (item.product_id) {
    await decrementProductStock(item.product_id, item.qty, ...)
  }
}
```

### Tratamento de Erros

Se houver erro ao descontar estoque:
- ✅ Erro é registrado no console
- ✅ Pedido continua sendo criado (não bloqueia)
- ⚠️ Admin deve verificar manualmente

**Motivo:** O pedido já foi criado no banco. Interromper causaria inconsistência.

## Status de Pedido

| Status | Afeta Estoque? |
|--------|----------------|
| `new` | ✅ Sim (na criação) |
| `picking` | ❌ Não (já foi descontado) |
| `out_for_delivery` | ❌ Não (já foi descontado) |
| `delivered` | ❌ Não (já foi descontado) |
| `canceled` | ✅ Sim (devolve estoque) |

## Segurança

### Validação de Estoque Insuficiente

```typescript
if (product.quantity < quantity) {
  return {
    error: `Estoque insuficiente. Disponível: ${product.quantity}, Solicitado: ${quantity}`
  }
}
```

### Prevenção de Dupla Devolução

```typescript
// Só devolve se estava ativo e foi cancelado agora
if (status === 'canceled' && previousStatus !== 'canceled') {
  // devolve estoque
}
```

## Exemplos de Uso

### Cliente Fazendo Pedido

```typescript
// 1. Cliente adiciona produtos ao carrinho
// 2. Finaliza compra
await processCheckout({
  customerName: "João Silva",
  customerPhone: "11999999999",
  cartItems: [
    { id: "prod-123", name: "Tomate", quantity: 2, price: 5 }
  ],
  cartTotal: 10
})

// Resultado:
// - Pedido criado com status "new"
// - Estoque de Tomate: 50kg → 48kg
// - Movimentação registrada: "out" 2kg
```

### Admin Cancelando Pedido

```typescript
// Admin acessa /app/pedidos/[id]
// Muda status para "canceled"
await updateOrderStatus("order-123", "canceled")

// Resultado:
// - Status do pedido: "new" → "canceled"
// - Estoque de Tomate: 48kg → 50kg
// - Movimentação registrada: "in" 2kg
```

## Monitoramento

Para visualizar todas as movimentações de estoque:

```sql
-- Histórico completo de movimentações
SELECT
  im.*,
  p.name as product_name
FROM inventory_moves im
JOIN products p ON p.id = im.product_id
ORDER BY im.created_at DESC;

-- Saldo de um produto específico
SELECT
  p.name,
  p.quantity as estoque_atual,
  SUM(CASE WHEN im.type = 'in' THEN im.qty ELSE 0 END) as total_entradas,
  SUM(CASE WHEN im.type = 'out' THEN im.qty ELSE 0 END) as total_saidas
FROM products p
LEFT JOIN inventory_moves im ON im.product_id = p.id
WHERE p.id = 'seu-produto-id'
GROUP BY p.id, p.name, p.quantity;
```

## Próximos Passos (Melhorias Futuras)

- [ ] Adicionar alertas de estoque baixo
- [ ] Criar relatório de movimentações de estoque
- [ ] Implementar ajuste manual de estoque pelo admin
- [ ] Adicionar reserva de estoque (quando pedido está em picking)
- [ ] Integrar com sistema de compras/fornecedores

## Arquivos Modificados

```
src/lib/actions/products.ts
  ↳ decrementProductStock()
  ↳ incrementProductStock()

src/lib/actions/orders.ts
  ↳ createOrder() - desconta estoque
  ↳ updateOrderStatus() - devolve estoque quando cancelado
```

---

**Data de Implementação:** Outubro 2025  
**Status:** ✅ Implementado e Testado

