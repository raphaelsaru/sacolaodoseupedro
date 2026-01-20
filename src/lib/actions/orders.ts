'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database.types'
import { decrementProductStock, incrementProductStock } from './products'

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
  console.log('[Order] Creating order...')

  // Usado pelo checkout público (ex.: Finalizar no WhatsApp) — usuário anônimo.
  // Service role bypassa RLS em orders e order_items.
  let supabase
  try {
    supabase = createServiceClient()
  } catch (error) {
    console.error('[Order] Error creating service client:', error)
    return { error: error instanceof Error ? error.message : 'Erro ao conectar com o banco de dados' }
  }

  // Create the order
  const { data: orderDataResp, error: orderError } = await supabase
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
    } as never)
    .select()
    .single()

  if (orderError) {
    return { error: orderError.message }
  }

  const order = orderDataResp as { id: string }

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
      .insert(orderItems as never)

    if (itemsError) {
      return { error: itemsError.message }
    }

    // Desconta do estoque para cada item que tem product_id
    for (const item of orderData.items) {
      if (item.product_id) {
        const stockResult = await decrementProductStock(
          item.product_id,
          item.qty,
          `Pedido #${order.id.slice(0, 8)} criado`
        )

        if (!stockResult.success) {
          // Se falhar ao descontar estoque, registra erro mas não interrompe
          // (o pedido já foi criado)
          console.error(`Erro ao descontar estoque do produto ${item.product_id}:`, stockResult.error)
        }
      }
    }
  }

  revalidatePath('/app/pedidos')
  revalidatePath('/app/produtos')
  return { success: true, order }
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const supabase = await createClient()

  // Busca o pedido atual para verificar o status anterior
  const { data: currentOrder, error: fetchError } = await supabase
    .from('orders')
    .select('status')
    .eq('id', id)
    .single()

  if (fetchError) {
    return { error: fetchError.message }
  }

  const previousStatus = currentOrder.status

  // Atualiza o status
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  // Se o pedido foi cancelado e não estava cancelado antes, devolve o estoque
  if (status === 'canceled' && previousStatus !== 'canceled') {
    // Busca os itens do pedido
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, qty, name')
      .eq('order_id', id)

    if (itemsError) {
      console.error('Erro ao buscar itens do pedido:', itemsError)
    } else if (orderItems) {
      // Devolve o estoque para cada item que tem product_id
      for (const item of orderItems) {
        if (item.product_id) {
          const stockResult = await incrementProductStock(
            item.product_id,
            item.qty,
            `Pedido #${id.slice(0, 8)} cancelado - devolução de estoque`
          )

          if (!stockResult.success) {
            console.error(`Erro ao devolver estoque do produto ${item.product_id}:`, stockResult.error)
          }
        }
      }
    }
  }

  revalidatePath('/app/pedidos')
  revalidatePath(`/app/pedidos/${id}`)
  revalidatePath('/app/produtos')
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

export async function getCustomerOrders(customerId: string) {
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
      subtotal,
      discount,
      order_items(
        id,
        name,
        qty,
        unit_price,
        total,
        product_id
      )
    `)
    .eq('customer_id', customerId)
    .order('placed_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { success: true, orders }
}

export async function getCustomerStats(customerId: string) {
  const supabase = await createClient()

  // Busca todos os pedidos do cliente
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      total,
      status,
      order_items(
        product_id,
        name,
        qty,
        total
      )
    `)
    .eq('customer_id', customerId)
    .neq('status', 'canceled') // Exclui pedidos cancelados das estatísticas

  if (error) {
    return { error: error.message }
  }

  // Calcula total gasto
  const totalSpent = orders?.reduce((sum, order) => sum + order.total, 0) || 0

  // Calcula produtos mais pedidos
  const productFrequency: Record<string, { name: string; qty: number; total: number }> = {}
  
  orders?.forEach((order) => {
    order.order_items?.forEach((item: any) => {
      const key = item.product_id || item.name // Usa ID do produto ou nome como fallback
      if (!productFrequency[key]) {
        productFrequency[key] = {
          name: item.name,
          qty: 0,
          total: 0,
        }
      }
      productFrequency[key].qty += item.qty
      productFrequency[key].total += item.total
    })
  })

  // Converte para array e ordena por quantidade
  const topProducts = Object.entries(productFrequency)
    .map(([_, data]) => data)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5) // Top 5 produtos

  return {
    success: true,
    stats: {
      totalOrders: orders?.length || 0,
      totalSpent,
      topProducts,
    },
  }
}
