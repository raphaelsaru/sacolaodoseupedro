'use client'

import Image from 'next/image'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/cart-context'
import { toast } from 'sonner'

interface ProductCardProps {
  id: string
  name: string
  price: number
  unit: string
  unitStep: number
  image_url?: string | null
  category?: string
  quantity?: number
}

export function ProductCard({
  id,
  name,
  price,
  unit,
  unitStep,
  image_url,
  category,
  quantity: stock = 0,
}: ProductCardProps) {
  const { addItem, getItemQuantity, updateQuantity } = useCart()
  const cartQuantity = getItemQuantity(id)
  const isOutOfStock = stock <= 0

  const handleAdd = () => {
    if (isOutOfStock) {
      toast.error('Produto fora de estoque!')
      return
    }
    
    // Verificar se tem estoque suficiente
    if (unitStep > stock) {
      toast.error('Não é possível adicionar mais deste item ao carrinho pois não consta essa quantidade no estoque.')
      return
    }
    
    addItem(
      {
        id,
        type: 'product',
        name,
        price,
        unit,
        unitStep,
        image_url,
      },
      unitStep
    )
    toast.success(`${name} adicionado ao carrinho!`)
  }

  const handleIncrement = () => {
    if (isOutOfStock) {
      toast.error('Produto fora de estoque!')
      return
    }
    
    const newQuantity = cartQuantity + unitStep
    
    // Verificar se a nova quantidade excede o estoque
    if (newQuantity > stock) {
      // Ajustar para o máximo disponível em estoque
      const maxAvailable = Math.floor(stock / unitStep) * unitStep
      if (maxAvailable > cartQuantity) {
        updateQuantity(id, maxAvailable)
        toast.warning('Não é possível adicionar mais deste item ao carrinho pois não consta essa quantidade no estoque.')
      } else {
        toast.error('Não é possível adicionar mais deste item ao carrinho pois não consta essa quantidade no estoque.')
      }
      return
    }
    
    updateQuantity(id, newQuantity)
  }

  const handleDecrement = () => {
    if (cartQuantity - unitStep <= 0) {
      updateQuantity(id, 0)
      toast.info(`${name} removido do carrinho`)
    } else {
      updateQuantity(id, cartQuantity - unitStep)
    }
  }

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${isOutOfStock ? 'opacity-50' : ''}`}>
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
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
            🥬
          </div>
        )}
        {category && (
          <Badge className="absolute right-2 top-2">{category}</Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-green-600">
            R$ {price.toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground">/ {unit}</span>
        </div>
        {isOutOfStock && (
          <Badge variant="destructive" className="mt-2">
            Fora de estoque
          </Badge>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {cartQuantity === 0 ? (
          <Button 
            onClick={handleAdd} 
            className="w-full" 
            size="lg"
            disabled={isOutOfStock}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isOutOfStock ? 'Indisponível' : 'Adicionar'}
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
              <span className="text-lg font-semibold">
                {cartQuantity.toFixed(2)} {unit}
              </span>
            </div>
            <Button
              onClick={handleIncrement}
              variant="outline"
              size="icon"
              className="h-10 w-10"
              disabled={isOutOfStock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

