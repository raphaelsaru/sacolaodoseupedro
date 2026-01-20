import { createClient } from '@/lib/supabase/server'
import { BasketCard } from '@/components/basket-card'
import { Package } from 'lucide-react'

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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="animate-fade-up">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
          Cestas e Combos
        </h2>
        <p className="text-muted-foreground">
          Cestas especiais montadas com produtos frescos selecionados
        </p>
      </div>

      {baskets && baskets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {baskets.map((basket, index) => {
            const items = basket.basket_items.map((item: any) => ({
              product_name: item.product.name,
              qty: item.qty,
              unit_name: item.product.unit.name,
            }))

            return (
              <div
                key={basket.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <BasketCard
                  id={basket.id}
                  name={basket.name}
                  description={basket.description}
                  price={basket.price}
                  image_url={basket.image_url}
                  items={items}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhuma cesta disponivel
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            No momento nao temos cestas disponiveis. Volte em breve para conferir nossas novidades!
          </p>
        </div>
      )}
    </div>
  )
}
