import { PublicHeader } from '@/components/public-header'
import Image from 'next/image'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      {/* Hero Banner */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden">
        <Image
          src="/sacolao-seu-pedro-top.jpeg"
          alt="Sacolão do Seu Pedro - Frutas e Verduras Frescas"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent" />
      </div>
      <main className="container mx-auto px-4 py-6 max-w-7xl">{children}</main>
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground max-w-7xl">
          <p>© 2025 Sacolão do Seu Pedro. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

