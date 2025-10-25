'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createBasket(formData: FormData, items: Array<{ product_id: string; qty: number }>) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const image = formData.get('image') as File | null

  let image_url = null

  // Upload image if provided
  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop()
    const fileName = `basket-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, image)

    if (uploadError) {
      return { error: 'Erro ao fazer upload da imagem' }
    }

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName)

    image_url = urlData.publicUrl
  }

  // Create basket
  const { data: basket, error: basketError } = await supabase
    .from('baskets')
    .insert({
      name,
      description: description || null,
      price,
      image_url,
    })
    .select()
    .single()

  if (basketError) {
    return { error: basketError.message }
  }

  // Create basket items
  if (items.length > 0) {
    const basketItems = items.map((item) => ({
      basket_id: basket.id,
      product_id: item.product_id,
      qty: item.qty,
    }))

    const { error: itemsError } = await supabase
      .from('basket_items')
      .insert(basketItems)

    if (itemsError) {
      return { error: itemsError.message }
    }
  }

  revalidatePath('/app/cestas')
  return { success: true }
}

export async function updateBasket(
  id: string,
  formData: FormData,
  items: Array<{ product_id: string; qty: number }>
) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const image = formData.get('image') as File | null

  let image_url: string | null = null

  // Upload new image if provided
  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop()
    const fileName = `basket-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, image)

    if (uploadError) {
      return { error: 'Erro ao fazer upload da imagem' }
    }

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName)

    image_url = urlData.publicUrl
  }

  // Update basket
  const updateData: any = {
    name,
    description: description || null,
    price,
  }

  if (image_url) {
    updateData.image_url = image_url
  }

  const { error: basketError } = await supabase
    .from('baskets')
    .update(updateData)
    .eq('id', id)

  if (basketError) {
    return { error: basketError.message }
  }

  // Delete existing items
  await supabase.from('basket_items').delete().eq('basket_id', id)

  // Create new items
  if (items.length > 0) {
    const basketItems = items.map((item) => ({
      basket_id: id,
      product_id: item.product_id,
      qty: item.qty,
    }))

    const { error: itemsError } = await supabase
      .from('basket_items')
      .insert(basketItems)

    if (itemsError) {
      return { error: itemsError.message }
    }
  }

  revalidatePath('/app/cestas')
  return { success: true }
}

export async function toggleBasketActive(id: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('baskets')
    .update({ is_active: !isActive })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/cestas')
  return { success: true }
}

export async function deleteBasket(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('baskets').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/cestas')
  return { success: true }
}

