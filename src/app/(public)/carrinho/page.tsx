'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCart } from '@/contexts/cart-context'
import { toast } from 'sonner'
import { processCheckout } from '@/lib/actions/checkout'

export default function CarrinhoPage() {
  const { cart, updateQuantity, removeItem, clearCart } = useCart()
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      toast.error('Por favor, informe seu nome')
      return
    }

    if (!customerPhone.trim()) {
      toast.error('Por favor, informe seu telefone')
      return
    }

    if (!paymentMethod) {
      toast.error('Por favor, selecione a forma de pagamento')
      return
    }

    setIsProcessing(true)

    try {
      // Process checkout and save to database
      const checkoutResult = await processCheckout({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        paymentMethod,
        notes: notes.trim(),
        cartItems: cart.items,
        cartTotal: cart.total,
      })

      if (!checkoutResult.success) {
        toast.error(checkoutResult.error || 'Erro ao processar pedido')
        return
      }

      // Build WhatsApp message (using text instead of emojis to avoid encoding issues)
      let message = `*NOVO PEDIDO - Sacolao do Seu Pedro*\n\n`
      message += `*Pedido #${checkoutResult.order.id.slice(0, 8)}*\n`
      message += `*Cliente:* ${customerName}\n`
      message += `*Telefone:* ${customerPhone}\n`
      message += `*Pagamento:* ${paymentMethod}\n\n`
      message += `*ITENS DO PEDIDO:*\n\n`

      cart.items.forEach((item, index) => {
        message += `${index + 1}. *${item.name}*\n`
        if (item.type === 'product') {
          message += `   Quantidade: ${item.quantity.toFixed(2)} ${item.unit}\n`
        } else {
          message += `   Quantidade: ${item.quantity}x\n`
        }
        message += `   Valor: R$ ${(item.price * item.quantity).toFixed(2)}\n\n`
      })

      message += `*TOTAL: R$ ${cart.total.toFixed(2)}*\n\n`

      if (notes.trim()) {
        message += `*Observacoes:*\n${notes}\n\n`
      }

      message += `_Pedido enviado via site e salvo no sistema_`

      // Encode message for URL
      const encodedMessage = encodeURIComponent(message)
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5561999999999'
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

      // Open WhatsApp
      window.open(whatsappUrl, '_blank')

      // Clear cart after checkout
      toast.success('Pedido salvo e enviado! Aguarde o contato do Seu Pedro.')
      clearCart()
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Erro ao processar pedido. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ShoppingBag className="h-24 w-24 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h2>
        <p className="text-muted-foreground mb-6">
          Adicione produtos ao carrinho para continuar
        </p>
        <Link href="/">
          <Button size="lg">Ver Produtos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Carrinho</h1>
        <p className="text-muted-foreground">
          Revise seu pedido e finalize via WhatsApp
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">
                        {item.type === 'basket' ? '🧺' : '🥬'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      R$ {item.price.toFixed(2)}
                      {item.type === 'product' && item.unit ? ` / ${item.unit}` : ''}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity - (item.unitStep || 1)
                          )
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="min-w-[60px] text-center font-medium">
                        {item.type === 'product' && item.unit ? item.quantity.toFixed(2) : item.quantity}
                        {item.type === 'product' && item.unit ? ` ${item.unit}` : 'x'}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity + (item.unitStep || 1)
                          )
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        removeItem(item.id)
                        toast.info(`${item.name} removido do carrinho`)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <p className="text-lg font-bold">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Checkout Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold">Finalizar Pedido</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment">Forma de pagamento *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Cartão">
                      Cartão
                    </SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Alguma observação sobre o pedido?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Resumo do Pedido</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>R$ {cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-green-600">R$ {cart.total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleCheckout} 
                className="w-full" 
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processando...' : 'Finalizar no WhatsApp'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

