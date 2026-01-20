'use client'

import Image from 'next/image'
import { Plus, Minus, ShoppingBag, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

    if (unitStep > stock) {
      toast.error('Quantidade indisponivel no estoque.')
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

    if (newQuantity > stock) {
      const maxAvailable = Math.floor(stock / unitStep) * unitStep
      if (maxAvailable > cartQuantity) {
        updateQuantity(id, maxAvailable)
        toast.warning('Quantidade maxima disponivel em estoque.')
      } else {
        toast.error('Quantidade indisponivel no estoque.')
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
    <article
      className={`group relative bg-card rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20 ${
        isOutOfStock ? 'opacity-60' : ''
      }`}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Package className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}

        {/* Category Badge */}
        {category && (
          <Badge
            variant="secondary"
            className="absolute left-3 top-3 bg-background/90 backdrop-blur-sm text-xs font-medium shadow-sm"
          >
            {category}
          </Badge>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
            <Badge variant="destructive" className="text-sm font-semibold px-4 py-1.5">
              Fora de estoque
            </Badge>
          </div>
        )}

        {/* Quick Add Button - Only visible on hover when not in cart */}
        {cartQuantity === 0 && !isOutOfStock && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <Button
              onClick={handleAdd}
              size="sm"
              className="rounded-full px-6 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name */}
        <h3 className="font-semibold text-base line-clamp-2 leading-snug mb-2 min-h-[2.5rem]">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-4">
          <span className="text-2xl font-bold text-primary tracking-tight">
            R$ {price.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-sm text-muted-foreground">
            /{unit}
          </span>
        </div>

        {/* Action Area */}
        {cartQuantity === 0 ? (
          <Button
            onClick={handleAdd}
            className="w-full h-11 rounded-xl font-semibold transition-all duration-200 btn-press"
            disabled={isOutOfStock}
          >
            {isOutOfStock ? (
              'Indisponivel'
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Adicionar
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDecrement}
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl shrink-0 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 btn-press"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <div className="flex-1 flex flex-col items-center justify-center bg-muted/50 rounded-xl h-11 px-2">
              <span className="text-sm font-bold text-foreground leading-none">
                {cartQuantity.toFixed(unit === 'kg' ? 2 : 0).replace('.', ',')}
              </span>
              <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                {unit}
              </span>
            </div>

            <Button
              onClick={handleIncrement}
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl shrink-0 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 btn-press"
              disabled={isOutOfStock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Cart Indicator */}
      {cartQuantity > 0 && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md animate-scale-in">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </article>
  )
}
