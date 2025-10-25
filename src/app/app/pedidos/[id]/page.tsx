import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft } from 'lucide-react'
import { OrderStatusSelect } from '@/components/order-status-select'
import { PaymentStatusSelect } from '@/components/payment-status-select'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PedidoDetalhePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(full_name, phone, email),
      address:addresses(street, number, complement, neighborhood, city, state, zip),
      order_items(
        id,
        name,
        qty,
        unit_price,
        total,
        unit:units(name)
      )
    `)
    .eq('id', id)
    .single()

  if (!order) {
    notFound()
  }

  const statusLabels: Record<string, string> = {
    new: 'Novo',
    picking: 'Separando',
    out_for_delivery: 'Saiu para entrega',
    delivered: 'Entregue',
    canceled: 'Cancelado',
  }

  const paymentLabels: Record<string, string> = {
    pix: 'Pix',
    cash: 'Dinheiro',
    card_on_delivery: 'Cartão',
    other: 'Outro',
  }

  const channelLabels: Record<string, string> = {
    whatsapp: 'WhatsApp',
    counter: 'Balcão',
    web: 'Web',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/pedidos">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Pedido #{order.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground">
            Realizado em {new Date(order.placed_at).toLocaleDateString('pt-BR')} às{' '}
            {new Date(order.placed_at).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.order_items.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">
                        {Number(item.qty).toFixed(2)} {item.unit?.name}
                      </TableCell>
                      <TableCell className="text-right">
                        R$ {Number(item.unit_price).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        R$ {Number(item.total).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {Number(order.subtotal).toFixed(2)}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto</span>
                    <span>- R$ {Number(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">
                    R$ {Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Canal:</span>
                <Badge variant="outline">{channelLabels[order.channel]}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Nome</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer?.full_name || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Telefone</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer?.phone || '-'}
                </p>
              </div>
              {order.customer?.email && (
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer.email}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Método</p>
                <p className="text-sm text-muted-foreground">
                  {order.payment_method
                    ? paymentLabels[order.payment_method]
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Status</p>
                <PaymentStatusSelect orderId={order.id} currentPaid={order.paid} />
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          {order.address && (
            <Card>
              <CardHeader>
                <CardTitle>Endereço de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {order.address.street}, {order.address.number}
                  {order.address.complement && `, ${order.address.complement}`}
                  <br />
                  {order.address.neighborhood}
                  <br />
                  {order.address.city} - {order.address.state}
                  {order.address.zip && (
                    <>
                      <br />
                      CEP: {order.address.zip}
                    </>
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

