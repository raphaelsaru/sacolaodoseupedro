import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { BasketActions } from '@/components/basket-actions'

export default async function CestasAdminPage() {
  const supabase = await createClient()

  const { data: baskets } = await supabase
    .from('baskets')
    .select(`
      *,
      basket_items(
        id,
        qty,
        product:products(name)
      )
    `)
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cestas e Combos</h1>
          <p className="text-muted-foreground">
            Gerencie as cestas especiais do sacolão
          </p>
        </div>
        <Link href="/app/cestas/nova">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Cesta
          </Button>
        </Link>
      </div>

      {baskets && baskets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {baskets.map((basket) => (
            <Card key={basket.id}>
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {basket.image_url ? (
                  <Image
                    src={basket.image_url}
                    alt={basket.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-6xl">
                    🧺
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{basket.name}</CardTitle>
                    {basket.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {basket.description}
                      </p>
                    )}
                  </div>
                  <BasketActions basketId={basket.id} isActive={basket.is_active} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-green-600">
                    R$ {Number(basket.price).toFixed(2)}
                  </div>
                  <div>
                    <Badge variant={basket.is_active ? 'secondary' : 'outline'}>
                      {basket.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {basket.basket_items.length} produto(s)
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Nenhuma cesta cadastrada
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

