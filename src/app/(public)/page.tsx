'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ProductCard } from '@/components/product-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, X, SlidersHorizontal, Package } from 'lucide-react'

// Skeleton component for loading state
function ProductSkeleton() {
  return (
    <div className="bg-card rounded-2xl border overflow-hidden">
      <div className="aspect-square bg-muted skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded-lg skeleton w-3/4" />
        <div className="h-4 bg-muted rounded-lg skeleton w-1/2" />
        <div className="h-8 bg-muted rounded-lg skeleton w-2/3" />
        <div className="h-11 bg-muted rounded-xl skeleton" />
      </div>
    </div>
  )
}

function HomePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('position')

      if (data) setCategories(data)
    }

    fetchCategories()
  }, [])

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(name),
          unit:units(name, step)
        `)
        .eq('is_active', true)

      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      if (category && category !== 'all') {
        query = query.eq('category_id', category)
      }

      const { data } = await query.order('name')

      if (data) setProducts(data)
      setLoading(false)
    }

    fetchProducts()
  }, [search, category])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set('category', value)
    } else {
      params.delete('category')
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    setSearch('')
    setCategory('all')
    router.push('/', { scroll: false })
  }

  const hasActiveFilters = search || (category && category !== 'all')

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="animate-fade-up">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2">
          Nossos Produtos
        </h2>
        <p className="text-muted-foreground">
          Frutas, verduras e legumes frescos selecionados para voce
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 animate-fade-up delay-100">
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              className="h-12 pl-12 pr-4 rounded-xl border-2 focus:border-primary/50 transition-all duration-200"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {search && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-12 px-4 rounded-xl border-2 transition-all duration-200 ${
              showFilters ? 'border-primary/50 bg-primary/5' : ''
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="hidden sm:inline ml-2">Filtros</span>
          </Button>
        </div>

        {/* Category Pills - Always visible on desktop, toggle on mobile */}
        <div className={`${showFilters ? 'block' : 'hidden sm:block'}`}>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                category === 'all'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  category === cat.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filtros ativos:</span>
            {search && (
              <Badge
                variant="secondary"
                className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                onClick={() => handleSearchChange('')}
              >
                Busca: {search}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            {category && category !== 'all' && (
              <Badge
                variant="secondary"
                className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                onClick={() => handleCategoryChange('all')}
              >
                {categories.find(c => c.id === category)?.name || 'Categoria'}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:underline font-medium"
            >
              Limpar todos
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <>
          {/* Results count */}
          <p className="text-sm text-muted-foreground animate-fade-in">
            {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  unit={product.unit?.name || 'un'}
                  unitStep={product.unit?.step || 1}
                  image_url={product.image_url}
                  category={product.category?.name}
                  quantity={product.quantity || 0}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            {hasActiveFilters
              ? 'Tente ajustar seus filtros ou buscar por outro termo.'
              : 'Ainda nao ha produtos cadastrados. Volte em breve!'}
          </p>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline" className="rounded-xl">
              Limpar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <div>
            <div className="h-8 w-48 bg-muted rounded-lg skeleton mb-2" />
            <div className="h-5 w-64 bg-muted rounded-lg skeleton" />
          </div>
          <div className="h-12 bg-muted rounded-xl skeleton" />
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  )
}
