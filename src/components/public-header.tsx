'use client'

import Link from 'next/link'
import { ShoppingCart, Leaf, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/cart-context'
import { useState, useEffect } from 'react'

export function PublicHeader() {
  const { cart } = useCart()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Produtos' },
    { href: '/cestas', label: 'Cestas' },
  ]

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'glass border-b shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300">
              <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-display font-bold tracking-tight text-foreground">
                Seu Pedro
              </span>
              <span className="hidden sm:block text-[10px] sm:text-xs text-muted-foreground font-medium tracking-wide uppercase">
                Sacolao Online
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 px-4 py-2 rounded-lg"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart Button */}
            <Link href="/carrinho">
              <Button
                variant="outline"
                size="lg"
                className="relative group h-10 sm:h-11 px-3 sm:px-4 rounded-xl border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
              >
                <ShoppingCart className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                {cart.items.length > 0 && (
                  <>
                    <span className="hidden sm:inline ml-2 text-sm font-semibold text-foreground">
                      {cart.items.length}
                    </span>
                    <Badge
                      className="absolute -right-2 -top-2 h-5 w-5 sm:hidden rounded-full p-0 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground border-2 border-background shadow-md animate-scale-in"
                    >
                      {cart.items.length}
                    </Badge>
                  </>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 rounded-xl"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t animate-fade-down">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 px-4 py-3 rounded-lg"
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
