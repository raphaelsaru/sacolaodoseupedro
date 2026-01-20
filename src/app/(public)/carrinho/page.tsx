'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MessageCircle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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

      const encodedMessage = encodeURIComponent(message)
      const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5561999999999'
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

      window.open(whatsappUrl, '_blank')

      toast.success('Pedido salvo e enviado! Aguarde o contato do Seu Pedro.')
      clearCart()
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Erro ao processar pedido. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Empty cart state
  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-muted-foreground/50" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Seu carrinho esta vazio
        </h2>
        <p className="text-muted-foreground text-center max-w-md mb-8">
          Adicione produtos ao carrinho para fazer seu pedido. Temos frutas, verduras e legumes frescos esperando por voce!
        </p>
        <Link href="/">
          <Button size="lg" className="rounded-xl px-8 h-12">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ver Produtos
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="animate-fade-up">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Continuar comprando
        </Link>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          Seu Carrinho
        </h1>
        <p className="text-muted-foreground mt-1">
          {cart.items.length} {cart.items.length === 1 ? 'item' : 'itens'} no carrinho
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item, index) => (
            <Card
              key={item.id}
              className="overflow-hidden animate-fade-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                      {item.type === 'product' && item.unit ? ` / ${item.unit}` : ''}
                    </p>

                    {/* Quantity Controls */}
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg shrink-0"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity - (item.unitStep || 1)
                          )
                        }
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <div className="min-w-[70px] text-center">
                        <span className="text-sm font-semibold">
                          {item.type === 'product' && item.unit
                            ? item.quantity.toFixed(2).replace('.', ',')
                            : item.quantity}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          {item.type === 'product' && item.unit ? item.unit : 'un'}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg shrink-0"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity + (item.unitStep || 1)
                          )
                        }
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Price & Remove */}
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        removeItem(item.id)
                        toast.info(`${item.name} removido do carrinho`)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <p className="text-lg font-bold text-primary">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Checkout Sidebar */}
        <div className="space-y-4 animate-fade-up delay-200">
          {/* Customer Form */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display">Seus Dados</CardTitle>
              <CardDescription>Informe seus dados para finalizar o pedido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome completo *
                </Label>
                <Input
                  id="name"
                  placeholder="Digite seu nome"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Telefone (WhatsApp) *
                </Label>
                <Input
                  id="phone"
                  placeholder="(61) 99999-9999"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment" className="text-sm font-medium">
                  Forma de pagamento *
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment" className="h-11 rounded-xl">
                    <SelectValue placeholder="Selecione uma opcao" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="Cartao">Cartao (Debito/Credito)</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Observacoes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Alguma observacao sobre o pedido? (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="rounded-xl resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items summary */}
              <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate max-w-[60%]">
                      {item.name}
                    </span>
                    <span className="font-medium shrink-0">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    R$ {cart.total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full h-12 rounded-xl text-base font-semibold btn-press"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Finalizar no WhatsApp
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Ao finalizar, voce sera redirecionado para o WhatsApp
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
