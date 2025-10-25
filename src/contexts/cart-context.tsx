'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { CartContextType, CartItem, CartState } from '@/lib/types/cart.types'

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'seupedro-cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>({
    items: [],
    total: 0,
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        setCart(parsed)
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  const calculateTotal = useCallback((items: CartItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [])

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setCart((prev) => {
      const existingItemIndex = prev.items.findIndex((i) => i.id === item.id)

      let newItems: CartItem[]

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        newItems = [...prev.items]
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        }
      } else {
        // Add new item
        newItems = [...prev.items, { ...item, quantity }]
      }

      return {
        items: newItems,
        total: calculateTotal(newItems),
      }
    })
  }, [calculateTotal])

  const removeItem = useCallback((id: string) => {
    setCart((prev) => {
      const newItems = prev.items.filter((item) => item.id !== id)
      return {
        items: newItems,
        total: calculateTotal(newItems),
      }
    })
  }, [calculateTotal])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    setCart((prev) => {
      const newItems = prev.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
      return {
        items: newItems,
        total: calculateTotal(newItems),
      }
    })
  }, [calculateTotal, removeItem])

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      total: 0,
    })
  }, [])

  const getItemQuantity = useCallback((id: string) => {
    const item = cart.items.find((i) => i.id === id)
    return item?.quantity ?? 0
  }, [cart.items])

  const value: CartContextType = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

