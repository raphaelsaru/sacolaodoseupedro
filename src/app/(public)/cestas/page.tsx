import { createClient } from '@/lib/supabase/server'
import { BasketCard } from '@/components/basket-card'

export default async function CestasPage() {
  const supabase = await createClient()

  // Fetch baskets with their items
  const { data: baskets } = await supabase
    .from('baskets')
    .select(`
      *,
      basket_items (
        qty,
        product:products (
          name,
          unit:units (name)
        )
      )
    `)
    .eq('is_active', true)
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cestas e Combos</h1>
        <p className="text-muted-foreground">
          Cestas especiais montadas com produtos selecionados
        </p>
      </div>

      {baskets && baskets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {baskets.map((basket) => {
            const items = basket.basket_items.map((item: any) => ({
              product_name: item.product.name,
              qty: item.qty,
              unit_name: item.product.unit.name,
            }))

            return (
              <BasketCard
                key={basket.id}
                id={basket.id}
                name={basket.name}
                description={basket.description}
                price={basket.price}
                image_url={basket.image_url}
                items={items}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Nenhuma cesta disponível no momento
          </p>
        </div>
      )}
    </div>
  )
}

