'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MoreHorizontal, Edit, Power, PowerOff, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toggleBasketActive, deleteBasket } from '@/lib/actions/baskets'
import { toast } from 'sonner'

interface BasketActionsProps {
  basketId: string
  isActive: boolean
}

export function BasketActions({ basketId, isActive }: BasketActionsProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggleActive = async () => {
    setLoading(true)
    try {
      const result = await toggleBasketActive(basketId, isActive)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          `Cesta ${isActive ? 'desativada' : 'ativada'} com sucesso!`
        )
        router.refresh()
      }
    } catch (error) {
      toast.error('Erro ao atualizar cesta')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const result = await deleteBasket(basketId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Cesta excluída com sucesso!')
        setShowDeleteDialog(false)
        router.refresh()
      }
    } catch (error) {
      toast.error('Erro ao excluir cesta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={loading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href={`/app/cestas/${basketId}/editar`}>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={handleToggleActive}>
            {isActive ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Desativar
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Ativar
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta cesta? Esta ação não pode
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

