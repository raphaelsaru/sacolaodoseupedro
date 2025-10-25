'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

export async function findOrCreateCustomer(customerData: {
  full_name: string
  phone: string
  email?: string
}) {
  const supabase = await createClient()

  // First, try to find existing customer by phone
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', customerData.phone)
    .single()

  if (existingCustomer) {
    // Update customer info if needed
    if (existingCustomer.full_name !== customerData.full_name || 
        (customerData.email && existingCustomer.email !== customerData.email)) {
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          full_name: customerData.full_name,
          email: customerData.email || existingCustomer.email,
        })
        .eq('id', existingCustomer.id)

      if (updateError) {
        return { error: updateError.message }
      }
    }
    return { success: true, customer: existingCustomer }
  }

  // Create new customer if not found
  const { data: newCustomer, error: createError } = await supabase
    .from('customers')
    .insert({
      full_name: customerData.full_name,
      phone: customerData.phone,
      email: customerData.email || null,
    })
    .select()
    .single()

  if (createError) {
    return { error: createError.message }
  }

  revalidatePath('/app/clientes')
  return { success: true, customer: newCustomer }
}

