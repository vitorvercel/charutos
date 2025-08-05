"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-provider"
import { LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navigation() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/estoque", label: "Estoque" },
    { href: "/degustacao", label: "Degustação" },
    { href: "/historico", label: "Histórico" },
  ]

  // Não mostrar navegação na página de login
  if (pathname === "/login") {
    return null
  }

  const userName = user?.user_metadata?.full_name || user?.email || "Usuário"

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-orange-500 text-2xl mr-3">📦</div>
            <h1 className="text-xl font-bold text-gray-900">Charutos Londrina</h1>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={
                      pathname === item.href
                        ? "bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-md"
                    }
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
