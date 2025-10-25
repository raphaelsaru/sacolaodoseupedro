export interface CartItem {
  id: string
  type: 'product' | 'basket'
  name: string
  price: number
  quantity: number
  unit?: string
  unitStep?: number
  image_url?: string | null
}

export interface CartState {
  items: CartItem[]
  total: number
}

export interface CartContextType {
  cart: CartState
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getItemQuantity: (id: string) => number
}

