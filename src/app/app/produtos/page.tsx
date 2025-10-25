import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus } from 'lucide-react'
import { ProductActions } from '@/components/product-actions'

export default async function ProdutosPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name),
      unit:units(name)
    `)
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo de produtos do sacolão
          </p>
        </div>
        <Link href="/app/produtos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          {products && products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xl">
                            🥬
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category?.name || '-'}</TableCell>
                    <TableCell>{product.unit?.name || '-'}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      R$ {Number(product.cost || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {Number(product.price).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={Number(product.quantity || 0) <= 0 ? 'destructive' : 'secondary'}
                      >
                        {Number(product.quantity || 0).toFixed(2)} {product.unit?.name || 'un'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'secondary' : 'outline'}>
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <ProductActions
                        productId={product.id}
                        isActive={product.is_active}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhum produto cadastrado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

