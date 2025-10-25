import { PublicHeader } from '@/components/public-header'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="container mx-auto px-4 py-6 max-w-7xl">{children}</main>
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground max-w-7xl">
          <p>© 2024 Sacolão do Seu Pedro. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

