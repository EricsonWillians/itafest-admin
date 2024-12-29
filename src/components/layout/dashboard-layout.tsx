import { useAuth } from '@/lib/auth'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import {
  MoonIcon,
  SunIcon,
  LogOut,
  Menu,
  Home,
  Calendar,
  Users,
  Building2,
  Settings,
} from 'lucide-react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const sidebarLinks = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'Events', href: '/dashboard/events' },
  { icon: Users, label: 'Users', href: '/dashboard/users' },
  { icon: Building2, label: 'Businesses', href: '/dashboard/businesses' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleNavigation = (href: string) => {
    navigate({ to: href as any })
  }

  const getUserInitials = () => {
    if (!user?.email) return 'U'
    return user.email.substring(0, 2).toUpperCase()
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-neptunic-light-blue dark:bg-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-neptunic-blue shadow-lg">
          <div className="container mx-auto flex h-16 items-center px-4">
            {/* Logo and Menu Toggle */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-white hover:bg-neptunic-green/20"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
              <h1 className="text-xl font-bold text-white">Itafest Admin</h1>
            </div>

            {/* Right Side Controls */}
            <div className="ml-auto flex items-center space-x-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-white hover:bg-neptunic-green/20"
              >
                <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL || ''} alt={user?.email || ''} />
                      <AvatarFallback className="bg-neptunic-green text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Administrator
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await logout()
                      navigate({ to: '/login' })
                    }}
                    className="text-red-500 focus:bg-red-50 focus:text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside
            className={cn(
              "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-white/50 backdrop-blur-lg transition-transform duration-300 ease-in-out dark:bg-gray-800/50",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <nav className="space-y-1 p-4">
              {sidebarLinks.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  className="w-full justify-start gap-2 text-neptunic-blue hover:bg-neptunic-green/10 dark:text-white"
                  onClick={() => handleNavigation(link.href)}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main
            className={cn(
              "flex-1 transition-all duration-300 ease-in-out",
              isSidebarOpen ? "ml-64" : "ml-0"
            )}
          >
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}