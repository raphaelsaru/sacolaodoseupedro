'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createAddress } from '@/lib/actions/customers'
import { toast } from 'sonner'

interface AddAddressDialogProps {
  customerId: string
}

export function AddAddressDialog({ customerId }: AddAddressDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await createAddress(customerId, formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Endereço adicionado com sucesso!')
        setOpen(false)
        router.refresh()
      }
    } catch (error) {
      toast.error('Erro ao adicionar endereço')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Endereço
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Endereço</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Etiqueta</Label>
            <Input
              id="label"
              name="label"
              placeholder="Casa, Trabalho, etc."
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="street">Rua *</Label>
              <Input
                id="street"
                name="street"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">Número</Label>
              <Input id="number" name="number" disabled={loading} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input id="complement" name="complement" disabled={loading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input id="neighborhood" name="neighborhood" disabled={loading} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                name="city"
                defaultValue="Planaltina"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                name="state"
                defaultValue="DF"
                maxLength={2}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip">CEP</Label>
            <Input id="zip" name="zip" disabled={loading} />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Salvando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

