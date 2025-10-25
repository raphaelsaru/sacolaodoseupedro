import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/product-form'

export default async function NovoProdutoPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('position')

  const { data: units } = await supabase.from('units').select('*').order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Novo Produto</h1>
        <p className="text-muted-foreground">
          Adicione um novo produto ao catálogo
        </p>
      </div>

      <ProductForm categories={categories || []} units={units || []} />
    </div>
  )
}

