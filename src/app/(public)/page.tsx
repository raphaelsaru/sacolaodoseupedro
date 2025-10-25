import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/product-card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ search?: string; category?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('position')

  // Fetch products with filters
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(name),
      unit:units(name, step)
    `)
    .eq('is_active', true)

  if (params.search) {
    query = query.ilike('name', `%${params.search}%`)
  }

  if (params.category) {
    query = query.eq('category_id', params.category)
  }

  const { data: products } = await query.order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nossos Produtos</h1>
        <p className="text-muted-foreground">
          Confira nossos produtos frescos e de qualidade
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            className="pl-10"
            name="search"
            defaultValue={params.search}
          />
        </div>
        <Select name="category" defaultValue={params.category}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              unit={product.unit?.name || 'un'}
              unitStep={product.unit?.step || 1}
              image_url={product.image_url}
              category={product.category?.name}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Nenhum produto encontrado
          </p>
        </div>
      )}
    </div>
  )
}
