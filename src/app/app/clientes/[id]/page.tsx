import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus } from 'lucide-react'
import { AddressCard } from '@/components/address-card'
import { AddAddressDialog } from '@/components/add-address-dialog'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ClienteDetalhePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from('customers')
    .select(`
      *,
      addresses(*)
    `)
    .eq('id', id)
    .single()

  if (!customer) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/clientes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{customer.full_name}</h1>
          <p className="text-muted-foreground">Detalhes do cliente</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Addresses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Endereços</CardTitle>
              <AddAddressDialog customerId={customer.id} />
            </CardHeader>
            <CardContent>
              {customer.addresses && customer.addresses.length > 0 ? (
                <div className="space-y-4">
                  {customer.addresses.map((address: any) => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      customerId={customer.id}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum endereço cadastrado
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Nome</p>
                <p className="text-sm text-muted-foreground">
                  {customer.full_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Telefone</p>
                <p className="text-sm text-muted-foreground">
                  {customer.phone}
                </p>
              </div>
              {customer.email && (
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.email}
                  </p>
                </div>
              )}
              {customer.notes && (
                <div>
                  <p className="text-sm font-medium">Observações</p>
                  <p className="text-sm text-muted-foreground">
                    {customer.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

