'use server'

import { createOrder, CreateOrderData } from './orders'
import { findOrCreateCustomer } from './customers'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type: 'product' | 'basket'
  unit?: string
  unitStep?: number
  image_url?: string
}

export interface CheckoutData {
  customerName: string
  customerPhone: string
  paymentMethod: string
  notes?: string
  cartItems: CartItem[]
  cartTotal: number
}

export async function processCheckout(checkoutData: CheckoutData) {
  try {
    // Find or create customer
    const customerResult = await findOrCreateCustomer({
      full_name: checkoutData.customerName,
      phone: checkoutData.customerPhone,
    })

    if (!customerResult.success) {
      return { error: customerResult.error }
    }

    // Map payment method to database format
    const paymentMethodMap: Record<string, string> = {
      'Pix': 'pix',
      'Dinheiro': 'cash',
      'Cartão na entrega': 'card_on_delivery',
      'Outro': 'other',
    }

    // Convert cart items to order items
    const orderItems = checkoutData.cartItems.map((item) => ({
      product_id: item.type === 'product' ? item.id : null,
      name: item.name,
      unit_id: null, // We'll need to get this from the product if needed
      qty: item.quantity,
      unit_price: item.price,
      total: item.price * item.quantity,
    }))

    // Create order data
    const orderData: CreateOrderData = {
      customer_id: customerResult.customer.id,
      status: 'new',
      subtotal: checkoutData.cartTotal,
      discount: 0,
      total: checkoutData.cartTotal,
      payment_method: paymentMethodMap[checkoutData.paymentMethod] as any,
      paid: false,
      channel: 'web',
      notes: checkoutData.notes || null,
      items: orderItems,
    }

    // Create the order
    const orderResult = await createOrder(orderData)

    if (!orderResult.success) {
      return { error: orderResult.error }
    }

    return { 
      success: true, 
      order: orderResult.order,
      customer: customerResult.customer 
    }
  } catch (error) {
    console.error('Error processing checkout:', error)
    return { error: 'Erro interno do servidor' }
  }
}
