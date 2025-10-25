import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Eye } from 'lucide-react'

export default async function ClientesPage() {
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from('customers')
    .select(`
      *,
      addresses(count)
    `)
    .order('full_name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie os clientes do sacolão
          </p>
        </div>
        <Link href="/app/clientes/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {customers && customers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Endereços</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.full_name}
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell>
                      {customer.addresses?.[0]?.count || 0} endereço(s)
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/app/clientes/${customer.id}`}>
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
              Nenhum cliente cadastrado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

