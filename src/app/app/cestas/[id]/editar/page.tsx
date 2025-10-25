import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BasketForm } from '@/components/basket-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarCestaPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: basket } = await supabase
    .from('baskets')
    .select(`
      *,
      basket_items(
        id,
        product_id,
        qty
      )
    `)
    .eq('id', id)
    .single()

  if (!basket) {
    notFound()
  }

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
        <h1 className="text-3xl font-bold">Editar Cesta</h1>
        <p className="text-muted-foreground">Atualize as informações da cesta</p>
      </div>

      <BasketForm basket={basket} products={products || []} />
    </div>
  )
}

