import { PublicHeader } from '@/components/public-header'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Clock, Instagram, Facebook, MessageCircle } from 'lucide-react'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader />

      {/* Hero Banner */}
      <div className="relative w-full h-72 sm:h-80 md:h-[420px] overflow-hidden">
        <Image
          src="/sacolao-seu-pedro-top.jpeg"
          alt="Sacolao do Seu Pedro - Frutas e Verduras Frescas"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8 sm:pb-12 max-w-7xl">
            <div className="max-w-2xl animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs sm:text-sm font-medium text-primary">
                  Entrega para toda Brasilia
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-3 tracking-tight">
                Frutas, verduras e legumes
                <span className="text-primary"> frescos</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
                Direto do produtor para sua mesa. Qualidade garantida pelo Seu Pedro.
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-auto">
        {/* Main Footer */}
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="inline-block mb-4">
                <h3 className="text-xl font-display font-bold text-foreground">
                  Seu Pedro
                </h3>
                <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
                  Sacolao Online
                </p>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O melhor sacolao de Brasilia, agora na palma da sua mao. Frutas, verduras e legumes frescos entregues com carinho.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase">
                Navegacao
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    Produtos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cestas"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    Cestas Prontas
                  </Link>
                </li>
                <li>
                  <Link
                    href="/carrinho"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    Meu Carrinho
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase">
                Contato
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span>Brasilia, DF</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>(61) 99999-9999</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>Seg - Sab: 7h - 19h</span>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 tracking-wide uppercase">
                Redes Sociais
              </h4>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Siga-nos para ofertas exclusivas!
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <p className="text-xs text-muted-foreground">
                2025 Sacolao do Seu Pedro. Todos os direitos reservados.
              </p>
              <p className="text-xs text-muted-foreground">
                Feito com carinho em Brasilia
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
