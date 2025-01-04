// DashboardLayout.tsx
import { useAuth } from '@/lib/auth'
import { Outlet, useNavigate, useRouter } from '@tanstack/react-router'
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
  ShoppingBag,
  Tag
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

// Debug utility
const DEBUG = {
  enabled: import.meta.env.DEV,
  log: (area: string, message: string, data?: any) => {
    if (!DEBUG.enabled) return;
    console.log(
      `%c🎯 [Dashboard Layout][${area}] ${message}`,
      'color: #059669; font-weight: bold;',
      data || ''
    );
  },
  error: (area: string, message: string, error?: any) => {
    if (!DEBUG.enabled) return;
    console.error(
      `%c❌ [Dashboard Layout][${area}] ${message}`,
      'color: #DC2626; font-weight: bold;',
      error || ''
    );
  }
};

const sidebarLinks = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Building2, label: 'Businesses', href: '/dashboard/businesses' },
  { icon: Calendar, label: 'Events', href: '/dashboard/events' },
  { icon: Users, label: 'Users', href: '/dashboard/users' },
  { icon: ShoppingBag, label: 'Ads', href: '/dashboard/ads' },
  { icon: Tag, label: 'Categories', href: '/dashboard/categories' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export function DashboardLayout() {
  DEBUG.log('Lifecycle', 'DashboardLayout rendering started');

  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleNavigation = (href: string) => {
    DEBUG.log('Navigation', 'Navigation attempted', {
      target: href,
      currentPath: window.location.pathname
    });
    try {
      navigate({ to: href as any })
      DEBUG.log('Navigation', 'Navigation successful', { href });
    } catch (error) {
      DEBUG.error('Navigation', 'Navigation failed', error);
    }
  }

  // Wrap everything with your auth guard
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>

            <h1 className="ml-4 text-xl font-bold">Admin Panel</h1>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL} />
                      <AvatarFallback>{user?.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400"
                    onClick={() => {
                      logout();
                      navigate({ to: '/login' });
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
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
              "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <nav className="space-y-1 p-4">
              {sidebarLinks.map((link) => (
                <Button
                  key={link.href}
                  variant={window.location.pathname === link.href ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => handleNavigation(link.href)}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Button>
              ))}
            </nav>
          </aside>

          {/* Main Content - Renders child routes here */}
          <main
            className={cn(
              "flex-1 transition-all duration-200 ease-in-out",
              isSidebarOpen ? "ml-64" : "ml-0"
            )}
          >
            <div className="container mx-auto p-6">
              {/* Critical: This is where child routes (e.g. BusinessPage) appear */}
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}

export default DashboardLayout
