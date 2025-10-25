'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/cart-context'

export function PublicHeader() {
  const { cart } = useCart()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between max-w-7xl">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-green-600">
            🥬 Sacolão do Seu Pedro
          </span>
        </Link>

        <nav className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost">Produtos</Button>
          </Link>
          <Link href="/cestas">
            <Button variant="ghost">Cestas</Button>
          </Link>
          <Link href="/carrinho">
            <Button variant="outline" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cart.items.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                >
                  {cart.items.length}
                </Badge>
              )}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

