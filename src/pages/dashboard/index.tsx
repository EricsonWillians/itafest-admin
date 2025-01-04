import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import {
  ActivityIcon,
  Users,
  Calendar,
  Building2,
  Tag,
  ShoppingBag,
  Settings,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'

// Type definitions
interface DashboardStats {
  users: {
    total: number
    growth: number
  }
  events: {
    total: number
    active: number
    new: number
  }
  businesses: {
    total: number
    new: number
  }
  ads: {
    active: number
    impressions: number
  }
}

// Enhanced debug utility
const DEBUG = {
  enabled: import.meta.env.DEV,
  log: (area: string, message: string, data?: any) => {
    if (!DEBUG.enabled) return
    console.log(
      `%c📊 [Dashboard Page][${area}] ${message}`,
      'color: #2563EB; font-weight: bold;',
      data || ''
    )
  },
  info: (area: string, message: string, data?: any) => {
    if (!DEBUG.enabled) return
    console.info(
      `%cℹ️ [Dashboard Page][${area}] ${message}`,
      'color: #059669; font-weight: bold;',
      data || ''
    )
  },
  error: (area: string, message: string, err?: any) => {
    if (!DEBUG.enabled) return
    console.error(
      `%c❌ [Dashboard Page][${area}] ${message}`,
      'color: #DC2626; font-weight: bold;',
      err || ''
    )
  },
}

// Navigation items reflecting backend structure
const navigationItems = [
  {
    title: 'Businesses',
    path: '/dashboard/businesses',
    icon: Building2,
    description: 'Manage registered businesses',
  },
  {
    title: 'Events',
    path: '/dashboard/events',
    icon: Calendar,
    description: 'Event management',
  },
  {
    title: 'Users',
    path: '/dashboard/users',
    icon: Users,
    description: 'User administration',
  },
  {
    title: 'Ads',
    path: '/dashboard/ads',
    icon: ShoppingBag,
    description: 'Advertisement management',
  },
  {
    title: 'Categories',
    path: '/dashboard/categories',
    icon: Tag,
    description: 'Category management',
  },
  {
    title: 'Settings',
    path: '/dashboard/settings',
    icon: Settings,
    description: 'System settings',
  },
]

export function DashboardPage() {
  const navigate = useNavigate()

  // Fetch dashboard stats (mock for now)
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      DEBUG.log('Stats Query', 'Starting to fetch dashboard stats')
      // Simulate an API call
      const mockStats: DashboardStats = {
        users: { total: 1234, growth: 20.1 },
        events: { total: 45, active: 12, new: 5 },
        businesses: { total: 573, new: 8 },
        ads: { active: 89, impressions: 12500 },
      }
      return mockStats
    },
    onSuccess: (data) => {
      DEBUG.info('Stats Query', 'Successfully fetched stats', data)
    },
    onError: (err) => {
      DEBUG.error('Stats Query', 'Error fetching stats', err)
    },
  })

  // Lifecycle logs
  useEffect(() => {
    DEBUG.log('Mount', 'Dashboard page mounted')
    return () => {
      DEBUG.log('Cleanup', 'Dashboard page unmounting')
    }
  }, [])

  if (isLoading) {
    DEBUG.log('Render', 'Showing loading state')
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    DEBUG.error('Render', 'Showing error state', error)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {error instanceof Error
                ? error.message
                : 'Failed to load dashboard data'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  DEBUG.log('Render', 'Displaying dashboard content', { stats })

  return (
    <div className="space-y-6">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.users.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats?.users.growth}% from last month
            </p>
          </CardContent>
        </Card>

        {/* Active Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.events.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.events.new} new this week
            </p>
          </CardContent>
        </Card>

        {/* Businesses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Businesses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.businesses.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.businesses.new} new this week
            </p>
          </CardContent>
        </Card>

        {/* Active Ads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.ads.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.ads.impressions.toLocaleString()} impressions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {navigationItems.map((item) => (
          <Card
            key={item.path}
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => {
              DEBUG.log('Navigation', `Navigating to ${item.path}`)
              navigate({ to: item.path as any })
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
              <item.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Debug Panel */}
      {DEBUG.enabled && (
        <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-2 font-bold">🔍 Debug Info</h3>
          <pre className="text-sm">
            {JSON.stringify(
              {
                timestamp: new Date().toISOString(),
                component: 'DashboardPage',
                path: window.location.pathname,
                stats,
                navigationItems: navigationItems.map((i) => i.path),
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
