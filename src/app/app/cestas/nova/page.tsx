import { createClient } from '@/lib/supabase/server'
import { BasketForm } from '@/components/basket-form'

export default async function NovaCestaPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      unit:units(name)
    `)
    .eq('is_active', true)
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nova Cesta</h1>
        <p className="text-muted-foreground">Crie uma nova cesta especial</p>
      </div>

      <BasketForm products={products || []} />
    </div>
  )
}

