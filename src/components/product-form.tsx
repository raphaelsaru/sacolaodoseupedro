'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createProduct, updateProduct } from '@/lib/actions/products'
import { toast } from 'sonner'

interface ProductFormProps {
  product?: any
  categories: any[]
  units: any[]
}

export function ProductForm({ product, categories, units }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image_url || null
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      const result = product
        ? await updateProduct(product.id, formData)
        : await createProduct(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          product
            ? 'Produto atualizado com sucesso!'
            : 'Produto criado com sucesso!'
        )
        router.push('/app/produtos')
      }
    } catch (error) {
      toast.error('Erro ao salvar produto')
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
              <CardTitle>Informações do Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={product?.name}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Categoria</Label>
                  <Select
                    name="category_id"
                    defaultValue={product?.category_id || undefined}
                    disabled={loading}
                  >
                    <SelectTrigger id="category_id">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit_id">Unidade *</Label>
                  <Select
                    name="unit_id"
                    defaultValue={product?.unit_id || undefined}
                    disabled={loading}
                    required
                  >
                    <SelectTrigger id="unit_id">
                      <SelectValue placeholder="Selecione uma unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={product?.price}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    name="sku"
                    defaultValue={product?.sku || ''}
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Imagem do Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagePreview && (
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
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
                  {product ? 'Nova imagem (opcional)' : 'Imagem'}
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
              {loading ? 'Salvando...' : product ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

