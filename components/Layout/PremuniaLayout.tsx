"use client"

import type React from "react"
import { useAuth } from "@/hooks/useSupabase"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  BarChart3,
  Users,
  Target,
  Mail,
  FileText,
  Settings,
  LogOut,
  Crown,
  UserCheck,
  Briefcase,
  TrendingUp,
  Search,
  Bell,
} from "lucide-react"

interface PremuniaLayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}

export function PremuniaLayout({ children, currentPage, onPageChange }: PremuniaLayoutProps) {
  const { user, signOut } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de Premunia CRM...</p>
        </div>
      </div>
    )
  }

  const getMenuItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Dashboard", icon: BarChart3 },
      { id: "prospects", label: "Prospects", icon: Users },
      { id: "opportunities", label: "Opportunités", icon: Target },
    ]

    const roleSpecificItems = {
      admin: [
        ...baseItems,
        { id: "automation", label: "Marketing Auto", icon: Mail },
        { id: "reports", label: "Rapports", icon: FileText },
        { id: "settings", label: "Paramètres", icon: Settings },
      ],
      manager: [...baseItems, { id: "reports", label: "Rapports", icon: FileText }],
      commercial: [...baseItems, { id: "comparator", label: "Comparateur", icon: Search }],
    }

    return roleSpecificItems[user.role] || baseItems
  }

  const getRoleIcon = () => {
    switch (user.role) {
      case "admin":
        return Crown
      case "manager":
        return UserCheck
      case "commercial":
        return Briefcase
      default:
        return Users
    }
  }

  const getRoleLabel = () => {
    switch (user.role) {
      case "admin":
        return "Administrateur"
      case "manager":
        return "Gestionnaire"
      case "commercial":
        return "Commercial"
      default:
        return "Utilisateur"
    }
  }

  const RoleIcon = getRoleIcon()

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar className="border-r border-slate-200 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Premunia CRM
                </h1>
                <p className="text-xs text-slate-500">Mutuelle Santé Seniors</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {getMenuItems().map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onPageChange(item.id)}
                        isActive={currentPage === item.id}
                        className="w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-blue-50 data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-500 data-[active=true]:to-indigo-500 data-[active=true]:text-white data-[active=true]:shadow-lg"
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 p-3 h-auto">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-sm">
                      {user.first_name?.[0]}
                      {user.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <div className="flex items-center gap-1">
                      <RoleIcon className="w-3 h-3 text-slate-500" />
                      <p className="text-xs text-slate-500">{getRoleLabel()}</p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="text-slate-600 hover:text-slate-900" />
              <div className="flex-1" />
              <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
