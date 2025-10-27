'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const category_id = formData.get('category_id') as string
  const unit_id = formData.get('unit_id') as string
  const price = parseFloat(formData.get('price') as string)
  const cost = parseFloat(formData.get('cost') as string)
  const quantity = parseFloat(formData.get('quantity') as string)
  const sku = formData.get('sku') as string
  const image = formData.get('image') as File | null

  let image_url = null

  // Upload image if provided
  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { error: uploadError, data } = await supabase.storage
      .from('products')
      .upload(fileName, image)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: `Erro ao fazer upload da imagem: ${uploadError.message}` }
    }

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName)

    image_url = urlData.publicUrl
  }

  const { error } = await supabase.from('products').insert({
    name,
    category_id: category_id || null,
    unit_id: unit_id || null,
    price,
    cost,
    quantity,
    sku: sku || null,
    image_url,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/produtos')
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const category_id = formData.get('category_id') as string
  const unit_id = formData.get('unit_id') as string
  const price = parseFloat(formData.get('price') as string)
  const cost = parseFloat(formData.get('cost') as string)
  const quantity = parseFloat(formData.get('quantity') as string)
  const sku = formData.get('sku') as string
  const image = formData.get('image') as File | null

  let image_url: string | null = null

  // Upload new image if provided
  if (image && image.size > 0) {
    const fileExt = image.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, image)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: `Erro ao fazer upload da imagem: ${uploadError.message}` }
    }

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName)

    image_url = urlData.publicUrl
  }

  const updateData: any = {
    name,
    category_id: category_id || null,
    unit_id: unit_id || null,
    price,
    cost,
    quantity,
    sku: sku || null,
  }

  if (image_url) {
    updateData.image_url = image_url
  }

  const { error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/produtos')
  return { success: true }
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .update({ is_active: !isActive })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/produtos')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/app/produtos')
  return { success: true }
}

/**
 * Decrementa o estoque de um produto e registra a movimentação
 */
export async function decrementProductStock(
  productId: string, 
  quantity: number, 
  note?: string
) {
  const supabase = await createClient()

  // Busca o produto atual
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('quantity')
    .eq('id', productId)
    .single()

  if (fetchError) {
    return { error: fetchError.message }
  }

  // Verifica se há estoque suficiente
  if (product.quantity < quantity) {
    return { error: `Estoque insuficiente. Disponível: ${product.quantity}, Solicitado: ${quantity}` }
  }

  // Atualiza o estoque
  const { error: updateError } = await supabase
    .from('products')
    .update({ quantity: product.quantity - quantity })
    .eq('id', productId)

  if (updateError) {
    return { error: updateError.message }
  }

  // Registra a movimentação
  const { error: moveError } = await supabase
    .from('inventory_moves')
    .insert({
      product_id: productId,
      type: 'out',
      qty: quantity,
      note: note || null,
    })

  if (moveError) {
    return { error: moveError.message }
  }

  return { success: true }
}

/**
 * Incrementa o estoque de um produto e registra a movimentação
 */
export async function incrementProductStock(
  productId: string, 
  quantity: number, 
  note?: string
) {
  const supabase = await createClient()

  // Busca o produto atual
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('quantity')
    .eq('id', productId)
    .single()

  if (fetchError) {
    return { error: fetchError.message }
  }

  // Atualiza o estoque
  const { error: updateError } = await supabase
    .from('products')
    .update({ quantity: product.quantity + quantity })
    .eq('id', productId)

  if (updateError) {
    return { error: updateError.message }
  }

  // Registra a movimentação
  const { error: moveError } = await supabase
    .from('inventory_moves')
    .insert({
      product_id: productId,
      type: 'in',
      qty: quantity,
      note: note || null,
    })

  if (moveError) {
    return { error: moveError.message }
  }

  return { success: true }
}

