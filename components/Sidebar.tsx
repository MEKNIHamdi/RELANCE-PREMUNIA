"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Mail,
  BarChart3,
  Settings,
  LogOut,
  TrendingUp,
  ChevronDown,
} from "lucide-react"
import { auth, type Profile } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  user: Profile
}

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "commercial"],
  },
  {
    id: "prospects",
    label: "Prospects",
    icon: Users,
    roles: ["admin", "manager", "commercial"],
  },
  {
    id: "pipeline",
    label: "Pipeline",
    icon: Calendar,
    roles: ["admin", "manager", "commercial"],
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Mail,
    roles: ["admin", "manager"],
  },
  {
    id: "reports",
    label: "Rapports",
    icon: BarChart3,
    roles: ["admin", "manager", "commercial"],
  },
  {
    id: "settings",
    label: "Paramètres",
    icon: Settings,
    roles: ["admin"],
  },
]

export function Sidebar({ currentPage, onPageChange, user }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSignOut = async () => {
    await auth.signOut()
    window.location.reload()
  }

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user.role))

  return (
    <div className={cn("bg-white border-r border-gray-200 flex flex-col", isCollapsed ? "w-16" : "w-64")}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-lg text-gray-900">Premunia</h1>
              <p className="text-xs text-gray-500">CRM Seniors</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isCollapsed && "px-2",
                  isActive && "bg-blue-600 text-white hover:bg-blue-700",
                )}
                onClick={() => onPageChange(item.id)}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 p-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {user.first_name[0]}
                  {user.last_name[0]}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              )}
              {!isCollapsed && <ChevronDown className="w-4 h-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
