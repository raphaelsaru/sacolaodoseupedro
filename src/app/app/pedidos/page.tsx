import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye } from 'lucide-react'

export default async function PedidosPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      total,
      status,
      placed_at,
      payment_method,
      customer:customers(full_name, phone)
    `)
    .order('placed_at', { ascending: false })

  const statusLabels: Record<string, string> = {
    new: 'Novo',
    picking: 'Separando',
    out_for_delivery: 'Saiu para entrega',
    delivered: 'Entregue',
    canceled: 'Cancelado',
  }

  const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    new: 'default',
    picking: 'secondary',
    out_for_delivery: 'outline',
    delivered: 'secondary',
    canceled: 'destructive',
  }

  const paymentLabels: Record<string, string> = {
    pix: 'Pix',
    cash: 'Dinheiro',
    card_on_delivery: 'Cartão na entrega',
    other: 'Outro',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os pedidos do sacolão
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      {new Date(order.placed_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {new Date(order.placed_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {(order.customer as any)?.full_name || 'Cliente'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(order.customer as any)?.phone || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.payment_method
                        ? paymentLabels[order.payment_method]
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      R$ {Number(order.total).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/app/pedidos/${order.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhum pedido encontrado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

