'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface PaymentStatusSelectProps {
  orderId: string
  currentPaid: boolean
}

const statusOptions = [
  { value: 'false', label: 'Pendente' },
  { value: 'true', label: 'Pago' },
]

export function PaymentStatusSelect({ orderId, currentPaid }: PaymentStatusSelectProps) {
  const router = useRouter()
  const [paid, setPaid] = useState(currentPaid.toString())
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newPaid: string) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('orders')
        .update({ paid: newPaid === 'true' })
        .eq('id', orderId)

      if (error) throw error

      setPaid(newPaid)
      toast.success('Status de pagamento atualizado com sucesso!')
      router.refresh()
    } catch (error: any) {
      toast.error('Erro ao atualizar status de pagamento')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Select value={paid} onValueChange={handleStatusChange} disabled={loading}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

