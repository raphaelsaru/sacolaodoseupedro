'use client'

import Image from 'next/image'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useCart } from '@/contexts/cart-context'
import { toast } from 'sonner'

interface BasketCardProps {
  id: string
  name: string
  description?: string | null
  price: number
  image_url?: string | null
  items: Array<{
    product_name: string
    qty: number
    unit_name: string
  }>
}

export function BasketCard({
  id,
  name,
  description,
  price,
  image_url,
  items,
}: BasketCardProps) {
  const { addItem, getItemQuantity, updateQuantity } = useCart()
  const quantity = getItemQuantity(id)

  const handleAdd = () => {
    addItem(
      {
        id,
        type: 'basket',
        name,
        price,
        image_url,
      },
      1
    )
    toast.success(`${name} adicionado ao carrinho!`)
  }

  const handleIncrement = () => {
    updateQuantity(id, quantity + 1)
  }

  const handleDecrement = () => {
    if (quantity - 1 <= 0) {
      updateQuantity(id, 0)
      toast.info(`${name} removido do carrinho`)
    } else {
      updateQuantity(id, quantity - 1)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">
            🧺
          </div>
        )}
      </div>

      <CardHeader>
        <h3 className="font-semibold text-xl">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">Contém:</p>
          <ul className="space-y-1">
            {items.map((item, index) => (
              <li key={index}>
                • {item.qty} {item.unit_name} de {item.product_name}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 pt-4 border-t">
          <span className="text-2xl font-bold text-green-600">
            R$ {price.toFixed(2)}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        {quantity === 0 ? (
          <Button onClick={handleAdd} className="w-full" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        ) : (
          <div className="flex w-full items-center gap-2">
            <Button
              onClick={handleDecrement}
              variant="outline"
              size="icon"
              className="h-10 w-10"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-center">
              <span className="text-lg font-semibold">{quantity}x</span>
            </div>
            <Button
              onClick={handleIncrement}
              variant="outline"
              size="icon"
              className="h-10 w-10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

