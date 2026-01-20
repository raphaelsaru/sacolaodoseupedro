'use client'

import Image from 'next/image'
import { Plus, Minus, ShoppingBag, Package, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
    toast.success(`${name} adicionada ao carrinho!`)
  }

  const handleIncrement = () => {
    updateQuantity(id, quantity + 1)
  }

  const handleDecrement = () => {
    if (quantity - 1 <= 0) {
      updateQuantity(id, 0)
      toast.info(`${name} removida do carrinho`)
    } else {
      updateQuantity(id, quantity - 1)
    }
  }

  return (
    <article className="group relative bg-card rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Package className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}

        {/* Badge */}
        <Badge
          className="absolute left-3 top-3 bg-primary text-primary-foreground shadow-md"
        >
          Cesta
        </Badge>

        {/* Items count badge */}
        <Badge
          variant="secondary"
          className="absolute right-3 top-3 bg-background/90 backdrop-blur-sm shadow-sm"
        >
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-5">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-semibold text-lg line-clamp-1 mb-1">{name}</h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            O que vem na cesta:
          </p>
          <ul className="space-y-1.5">
            {items.slice(0, 4).map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">
                  {item.qty} {item.unit_name} de {item.product_name}
                </span>
              </li>
            ))}
            {items.length > 4 && (
              <li className="text-xs text-muted-foreground pl-5">
                + {items.length - 4} {items.length - 4 === 1 ? 'item' : 'itens'}
              </li>
            )}
          </ul>
        </div>

        {/* Price & Action */}
        <div className="pt-4 border-t space-y-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-primary tracking-tight">
              R$ {price.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-sm text-muted-foreground">
              /cesta
            </span>
          </div>

          {quantity === 0 ? (
            <Button
              onClick={handleAdd}
              className="w-full h-11 rounded-xl font-semibold transition-all duration-200 btn-press"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Adicionar
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
                  {quantity}
                </span>
                <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                  {quantity === 1 ? 'cesta' : 'cestas'}
                </span>
              </div>

              <Button
                onClick={handleIncrement}
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-xl shrink-0 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 btn-press"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Cart Indicator */}
      {quantity > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md animate-scale-in">
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </article>
  )
}
