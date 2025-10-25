import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/product-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarProdutoPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) {
    notFound()
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('position')

  const { data: units } = await supabase.from('units').select('*').order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Produto</h1>
        <p className="text-muted-foreground">Atualize as informações do produto</p>
      </div>

      <ProductForm
        product={product}
        categories={categories || []}
        units={units || []}
      />
    </div>
  )
}

