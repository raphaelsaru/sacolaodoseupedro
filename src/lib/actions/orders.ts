'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database.types'

type OrderStatus = Database['public']['Tables']['orders']['Row']['status']
type PaymentMethod = Database['public']['Tables']['orders']['Row']['payment_method']
type OrderChannel = Database['public']['Tables']['orders']['Row']['channel']

export interface OrderItem {
  product_id?: string | null
  name: string
  unit_id?: string | null
  qty: number
  unit_price: number
  total: number
}

export interface CreateOrderData {
  customer_id?: string | null
  address_id?: string | null
  status?: OrderStatus
  subtotal: number
  discount?: number
  total: number
  payment_method?: PaymentMethod | null
  paid?: boolean
  channel?: OrderChannel
  notes?: string | null
  items: OrderItem[]
}

export async function createOrder(orderData: CreateOrderData) {
  const supabase = await createClient()

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: orderData.customer_id || null,
      address_id: orderData.address_id || null,
      status: orderData.status || 'new',
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      total: orderData.total,
      payment_method: orderData.payment_method || null,
      paid: orderData.paid || false,
      channel: orderData.channel || 'web',
      notes: orderData.notes || null,
      placed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (orderError) {
    return { error: orderError.message }
  }

  // Create order items
  if (orderData.items.length > 0) {
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id || null,
      name: item.name,
      unit_id: item.unit_id || null,
      qty: item.qty,
      unit_price: item.unit_price,
      total: item.total,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      return { error: itemsError.message }
    }
  }

  revalidatePath('/app/pedidos')
  return { success: true, order }
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/pedidos')
  revalidatePath(`/app/pedidos/${id}`)
  return { success: true }
}

export async function updateOrderPayment(id: string, paid: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('orders')
    .update({ paid })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/pedidos')
  revalidatePath(`/app/pedidos/${id}`)
  return { success: true }
}

export async function getOrder(id: string) {
  const supabase = await createClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(full_name, phone, email),
      address:addresses(street, number, complement, neighborhood, city, state, zip),
      order_items(
        id,
        name,
        qty,
        unit_price,
        total,
        unit:units(name)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { success: true, order }
}

export async function getOrders() {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      total,
      status,
      placed_at,
      payment_method,
      paid,
      customer:customers(full_name, phone)
    `)
    .order('placed_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { success: true, orders }
}
