'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database.types'

type CustomerRow = Database['public']['Tables']['customers']['Row']

export async function createCustomer(formData: FormData) {
  const supabase = await createClient()

  const full_name = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const notes = formData.get('notes') as string

  const { error } = await supabase.from('customers').insert({
    full_name,
    phone,
    email: email || null,
    notes: notes || null,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/clientes')
  return { success: true }
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient()

  const full_name = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const notes = formData.get('notes') as string

  const { error } = await supabase
    .from('customers')
    .update({
      full_name,
      phone,
      email: email || null,
      notes: notes || null,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/clientes')
  return { success: true }
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('customers').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/clientes')
  return { success: true }
}

export async function createAddress(customerId: string, formData: FormData) {
  const supabase = await createClient()

  const label = formData.get('label') as string
  const street = formData.get('street') as string
  const number = formData.get('number') as string
  const complement = formData.get('complement') as string
  const neighborhood = formData.get('neighborhood') as string
  const city = formData.get('city') as string
  const state = formData.get('state') as string
  const zip = formData.get('zip') as string
  const is_default = formData.get('is_default') === 'true'

  const { error } = await supabase.from('addresses').insert({
    customer_id: customerId,
    label: label || null,
    street,
    number: number || null,
    complement: complement || null,
    neighborhood: neighborhood || null,
    city,
    state,
    zip: zip || null,
    is_default,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/app/clientes/${customerId}`)
  return { success: true }
}

export async function deleteAddress(customerId: string, addressId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('addresses').delete().eq('id', addressId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/app/clientes/${customerId}`)
  return { success: true }
}

export type FindOrCreateCustomerResult =
  | { success: false; error: string }
  | { success: true; customer: { id: string } }

export async function findOrCreateCustomer(customerData: {
  full_name: string
  phone: string
  email?: string
}): Promise<FindOrCreateCustomerResult> {
  console.log('[Customer] Finding or creating customer:', customerData)

  // Checkout público (ex.: Finalizar no WhatsApp) é feito por anônimos — RLS bloquearia.
  // Service role bypassa RLS; usar apenas em server (nunca no browser).
  let supabase
  try {
    supabase = createServiceClient()
  } catch (error) {
    console.error('[Customer] Error creating service client:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro ao conectar com o banco de dados' }
  }

  // First, try to find existing customer by phone
  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', customerData.phone)
    .single()

  const existingCustomer = data as CustomerRow | null
  if (existingCustomer) {
    // Update customer info if needed
    if (existingCustomer.full_name !== customerData.full_name || 
        (customerData.email && existingCustomer.email !== customerData.email)) {
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          full_name: customerData.full_name,
          email: customerData.email || existingCustomer.email,
        } as never)
        .eq('id', existingCustomer.id)

      if (updateError) {
        return { success: false, error: updateError.message }
      }
    }
    return { success: true, customer: existingCustomer }
  }

  // Create new customer if not found
  const { data: newData, error: createError } = await supabase
    .from('customers')
    .insert({
      full_name: customerData.full_name,
      phone: customerData.phone,
      email: customerData.email || null,
    } as never)
    .select()
    .single()

  if (createError) {
    return { success: false, error: createError.message }
  }

  const newCustomer = newData as CustomerRow
  revalidatePath('/app/clientes')
  return { success: true, customer: newCustomer }
}

