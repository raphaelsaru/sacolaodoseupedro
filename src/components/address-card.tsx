'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Trash } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { deleteAddress } from '@/lib/actions/customers'
import { toast } from 'sonner'

interface AddressCardProps {
  address: any
  customerId: string
}

export function AddressCard({ address, customerId }: AddressCardProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const result = await deleteAddress(customerId, address.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Endereço excluído com sucesso!')
        setShowDeleteDialog(false)
        router.refresh()
      }
    } catch (error) {
      toast.error('Erro ao excluir endereço')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                {address.label && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{address.label}</Badge>
                    {address.is_default && (
                      <Badge>Padrão</Badge>
                    )}
                  </div>
                )}
                <p className="text-sm">
                  {address.street}, {address.number}
                  {address.complement && `, ${address.complement}`}
                </p>
                {address.neighborhood && (
                  <p className="text-sm text-muted-foreground">
                    {address.neighborhood}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {address.city} - {address.state}
                  {address.zip && ` • CEP: ${address.zip}`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este endereço? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

