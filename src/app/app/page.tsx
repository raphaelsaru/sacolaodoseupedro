import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { DollarSign, Package, ShoppingCart, TrendingUp, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get today's date range
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Get week's date range
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  // Fetch today's orders
  const { data: todayOrders, count: todayCount } = await supabase
    .from('orders')
    .select('total', { count: 'exact' })
    .gte('placed_at', today.toISOString())
    .lt('placed_at', tomorrow.toISOString())
    .neq('status', 'canceled')

  const todayTotal = todayOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0

  // Fetch week's orders
  const { data: weekOrders } = await supabase
    .from('orders')
    .select('total')
    .gte('placed_at', weekAgo.toISOString())
    .neq('status', 'canceled')

  const weekTotal = weekOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0

  // Fetch total products
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      id,
      total,
      status,
      placed_at,
      customer:customers(full_name, phone)
    `)
    .order('placed_at', { ascending: false })
    .limit(10)

  // Fetch top selling products
  const { data: topProducts } = await supabase
    .from('order_items')
    .select(`
      product_id,
      name,
      qty,
      product:products(image_url)
    `)
    .gte('created_at', weekAgo.toISOString())
    .limit(5)

  // Group and sum quantities for top products
  const productMap = new Map()
  topProducts?.forEach((item) => {
    if (item.product_id) {
      const existing = productMap.get(item.product_id)
      if (existing) {
        existing.qty += Number(item.qty)
      } else {
        productMap.set(item.product_id, {
          name: item.name,
          qty: Number(item.qty),
          image_url: item.product?.image_url,
        })
      }
    }
  })

  const topProductsList = Array.from(productMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu sacolão
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {todayTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {todayCount} pedido{todayCount !== 1 ? 's' : ''} hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Semana</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {weekTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Disponíveis no catálogo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {weekOrders && weekOrders.length > 0
                ? (weekTotal / weekOrders.length).toFixed(2)
                : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Média semanal
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.customer?.full_name || 'Cliente'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.placed_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
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
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhum pedido encontrado
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Mais Vendidos (7 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            {topProductsList.length > 0 ? (
              <div className="space-y-4">
                {topProductsList.map((product, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-2xl">
                      {product.image_url ? '📦' : '🥬'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.qty.toFixed(1)} unidades vendidas
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma venda na última semana
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

