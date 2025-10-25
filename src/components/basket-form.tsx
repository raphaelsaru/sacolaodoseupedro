'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createBasket, updateBasket } from '@/lib/actions/baskets'
import { toast } from 'sonner'

interface BasketFormProps {
  basket?: any
  products: any[]
}

export function BasketForm({ basket, products }: BasketFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(
    basket?.image_url || null
  )
  const [items, setItems] = useState<Array<{ product_id: string; qty: number }>>(
    basket?.basket_items?.map((item: any) => ({
      product_id: item.product_id,
      qty: item.qty,
    })) || []
  )

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addItem = () => {
    setItems([...items, { product_id: '', qty: 1 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (
    index: number,
    field: 'product_id' | 'qty',
    value: string | number
  ) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Validate items
      const validItems = items.filter(
        (item) => item.product_id && item.qty > 0
      )

      if (validItems.length === 0) {
        toast.error('Adicione pelo menos um produto à cesta')
        setLoading(false)
        return
      }

      const result = basket
        ? await updateBasket(basket.id, formData, validItems)
        : await createBasket(formData, validItems)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          basket ? 'Cesta atualizada com sucesso!' : 'Cesta criada com sucesso!'
        )
        router.push('/app/cestas')
      }
    } catch (error) {
      toast.error('Erro ao salvar cesta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Cesta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={basket?.name}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={basket?.description || ''}
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={basket?.price}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Produtos da Cesta</CardTitle>
              <Button type="button" size="sm" onClick={addItem} disabled={loading}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Produto
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Select
                      value={item.product_id}
                      onValueChange={(value) =>
                        updateItem(index, 'product_id', value)
                      }
                      disabled={loading}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} ({product.unit?.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={item.qty}
                      onChange={(e) =>
                        updateItem(index, 'qty', parseFloat(e.target.value))
                      }
                      className="w-24"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={loading}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum produto adicionado. Clique em "Adicionar Produto" para
                  começar.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Imagem da Cesta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagePreview && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="image">
                  {basket ? 'Nova imagem (opcional)' : 'Imagem'}
                </Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: JPG, PNG, GIF
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Salvando...' : basket ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

