'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface AdminHeaderProps {
  user: {
    email?: string
  }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success('Logout realizado com sucesso')
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast.error('Erro ao fazer logout')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between max-w-7xl">
        <div className="flex items-center space-x-4">
          <Link href="/app" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-green-600">
              🥬 Painel Admin
            </span>
          </Link>
        </div>

        <nav className="flex items-center space-x-4">
          <Link href="/app">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link href="/app/pedidos">
            <Button variant="ghost">Pedidos</Button>
          </Link>
          <Link href="/app/produtos">
            <Button variant="ghost">Produtos</Button>
          </Link>
          <Link href="/app/clientes">
            <Button variant="ghost">Clientes</Button>
          </Link>
          <Link href="/app/cestas">
            <Button variant="ghost">Cestas</Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  )
}

