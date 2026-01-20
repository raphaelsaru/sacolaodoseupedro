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
  image_url?: string | null
}

export interface CheckoutData {
  customerName: string
  customerPhone: string
  paymentMethod: string
  notes?: string
  cartItems: CartItem[]
  cartTotal: number
}

export type ProcessCheckoutResult =
  | { success: false; error: string }
  | { success: true; order: { id: string }; customer: { id: string } }

export async function processCheckout(checkoutData: CheckoutData): Promise<ProcessCheckoutResult> {
  try {
    console.log('[Checkout] Starting checkout process...', {
      customerName: checkoutData.customerName,
      customerPhone: checkoutData.customerPhone,
      paymentMethod: checkoutData.paymentMethod,
      itemsCount: checkoutData.cartItems.length,
      total: checkoutData.cartTotal,
    })

    // Find or create customer
    const customerResult = await findOrCreateCustomer({
      full_name: checkoutData.customerName,
      phone: checkoutData.customerPhone,
    })
    console.log('[Checkout] Customer result:', customerResult)

    if (!customerResult.success) {
      return { success: false, error: customerResult.error ?? 'Erro ao obter cliente' }
    }

    // Map payment method to database format
    const paymentMethodMap: Record<string, string> = {
      'Pix': 'pix',
      'Dinheiro': 'cash',
      'Cartao': 'card_on_delivery',
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
    console.log('[Checkout] Creating order with data:', JSON.stringify(orderData, null, 2))
    const orderResult = await createOrder(orderData)
    console.log('[Checkout] Order result:', orderResult)

    if (!orderResult.success) {
      return { success: false, error: orderResult.error ?? 'Erro ao criar pedido' }
    }

    return { 
      success: true, 
      order: orderResult.order,
      customer: customerResult.customer 
    }
  } catch (error) {
    console.error('Error processing checkout:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
    return { success: false, error: errorMessage }
  }
}
