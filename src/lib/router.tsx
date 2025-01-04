import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  type RoutePaths,
} from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'

// Layouts & Pages
import DashboardLayout from '@/components/layout/dashboard-layout'
import DashboardPage from '@/pages/dashboard'
import LoginPage from '@/pages/auth/login'
import BusinessPage from '@/pages/business'
import EventsPage from '@/pages/event'

// // Future placeholders (uncomment if needed):
// import { UsersPage } from '@/pages/users'
// import { AdsPage } from '@/pages/ads'
// import { CategoriesPage } from '@/pages/categories'
// import { TagsPage } from '@/pages/tags'
// import { SettingsPage } from '@/pages/settings'

// Environment & Configuration
const ENV = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL,
  apiVersion: 'v1',
} as const

const CONFIG = {
  routes: {
    defaultRedirect: '/dashboard',
    auth: {
      login: '/login',
      logout: '/logout',
      callback: '/auth/callback',
    },
    dashboard: {
      root: '/dashboard',
      businesses: '/dashboard/businesses',
      events: '/dashboard/events',
      // users: '/dashboard/users',
      // ads: '/dashboard/ads',
      // categories: '/dashboard/categories',
      // tags: '/dashboard/tags',
      // settings: '/dashboard/settings',
    },
  },
  auth: {
    sessionTimeout: 1000 * 60 * 30, // 30 minutes
    refreshThreshold: 1000 * 60 * 5, // 5 minutes before expiry
  },
} as const

// -------------------------
//      Route Logger
// -------------------------
class RouteLogger {
  private static instance: RouteLogger
  private static readonly levels = ['debug', 'info', 'warn', 'error'] as const
  private static readonly colors = {
    debug: '#8B5CF6',
    info: '#059669',
    warn: '#F59E0B',
    error: '#DC2626',
  }

  private constructor() {
    if (ENV.isDev) {
      console.log('%c🛣️ Router Logger Initialized', `color: ${RouteLogger.colors.info}; font-weight: bold;`)
    }
  }

  static getInstance(): RouteLogger {
    if (!RouteLogger.instance) {
      RouteLogger.instance = new RouteLogger()
    }
    return RouteLogger.instance
  }

  private formatMessage(level: typeof RouteLogger.levels[number], area: string, message: string): string {
    return `%c${level === 'error' ? '❌' : '🛣️'} [Router][${area}] ${message}`
  }

  private log(level: typeof RouteLogger.levels[number], area: string, message: string, data?: unknown): void {
    if (!ENV.isDev) return
    const formattedMessage = this.formatMessage(level, area, message)
    const style = `color: ${RouteLogger.colors[level]}; font-weight: bold;`
    console[level](formattedMessage, style, data || '')
  }

  debug = (area: string, message: string, data?: unknown) => this.log('debug', area, message, data)
  info = (area: string, message: string, data?: unknown) => this.log('info', area, message, data)
  warn = (area: string, message: string, data?: unknown) => this.log('warn', area, message, data)
  error = (area: string, message: string, data?: unknown) => this.log('error', area, message, data)
}

const Logger = RouteLogger.getInstance()

// -------------------------
//   Route Performance
// -------------------------
class RoutePerformance {
  private static measurements = new Map<string, number>()

  static start(path: string): void {
    this.measurements.set(path, performance.now())
  }

  static end(path: string): void {
    const start = this.measurements.get(path)
    if (start) {
      const duration = performance.now() - start
      this.measurements.delete(path)
      Logger.info('Performance', `Route transition: ${path}`, `${duration.toFixed(2)}ms`)
    }
  }
}

// -------------------------
//       Auth Guard
// -------------------------
const createAuthGuard = (options: { requireRoles?: string[] } = {}) => {
  return async () => {
    Logger.debug('Auth', 'Running auth guard', options)
    RoutePerformance.start(window.location.pathname)

    try {
      // Replace these with your real auth checks
      const isAuthenticated = true
      const userRoles = ['admin']

      if (!isAuthenticated) {
        throw redirect({
          to: CONFIG.routes.auth.login,
          search: { redirect: window.location.pathname },
        })
      }

      if (options.requireRoles && !options.requireRoles.some((role) => userRoles.includes(role))) {
        throw redirect({ to: CONFIG.routes.dashboard.root })
      }
    } catch (error) {
      Logger.error('Auth', 'Auth guard failed', error)
      throw error
    } finally {
      RoutePerformance.end(window.location.pathname)
    }
  }
}

// -------------------------
// Loading & Error Routes
// -------------------------
const LoadingRoute = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
)

const ErrorRoute = ({ error }: { error: Error }) => {
  Logger.error('Error', 'Route error caught', error)

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">
          {ENV.isDev ? error.message : 'Please try again later'}
        </p>
        {ENV.isDev && (
          <pre className="mt-4 max-w-2xl overflow-auto rounded-lg bg-muted p-4 text-left text-sm">
            {error.stack}
          </pre>
        )}
      </div>
    </div>
  )
}

// -------------------------
//     ROOT ROUTE TREE
// -------------------------
const rootRoute = createRootRoute({
  component: () => {
    Logger.debug('Route', 'Root route rendered')
    return <Outlet />
  },
})

// 1. "/login" — Unprotected route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'login',
  component: LoginPage,
})

// 2. "/" => redirect to "/dashboard"
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: CONFIG.routes.dashboard.root })
  },
})

// 3. "/dashboard" => Protected layout
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'dashboard',
  component: DashboardLayout,
  beforeLoad: createAuthGuard(), // apply guard
})

// 4. Dashboard index => "/dashboard"
const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/',
  component: DashboardPage,
})

// 5. Business index => "/dashboard/businesses"
const businessIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'businesses',
  component: BusinessPage,
})

// 6. Business detail => "/dashboard/businesses/:businessId"
const businessDetailRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'businesses/$businessId',
  component: BusinessPage,
})

// 7. Events index => "/dashboard/events"
const eventsIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'events',
  component: EventsPage,
})

// 8. (Optional) Event detail => "/dashboard/events/:eventId"
const eventDetailRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'events/$eventId',
  component: EventsPage, 
  // If you have a dedicated EventDetailPage, replace this component reference
})

/*
// 9. Users => "/dashboard/users"
const usersRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'users',
  component: UsersPage,
})

// 10. Ads => "/dashboard/ads"
const adsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'ads',
  component: AdsPage,
})

// 11. Categories => "/dashboard/categories"
const categoriesRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'categories',
  component: CategoriesPage,
})

// 12. Tags => "/dashboard/tags"
const tagsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'tags',
  component: TagsPage,
})

// 13. Settings => "/dashboard/settings"
const settingsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'settings',
  component: SettingsPage,
})
*/

// -------------------------
//      BUILD ROUTE TREE
// -------------------------
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute.addChildren([
    dashboardIndexRoute,
    businessIndexRoute,
    businessDetailRoute,
    eventsIndexRoute,
    eventDetailRoute,
    // Uncomment these placeholders once your pages are ready:
    // usersRoute,
    // adsRoute,
    // categoriesRoute,
    // tagsRoute,
    // settingsRoute,
  ]),
])

// -------------------------
//     CREATE THE ROUTER
// -------------------------
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingComponent: LoadingRoute,
  defaultErrorComponent: ErrorRoute,
  context: {
    env: ENV,
    config: CONFIG,
  },
})

// -------------------------
// DEVELOPMENT UTILITIES
// -------------------------
if (ENV.isDev) {
  try {
    const routes = Array.from(routeTree.routesByPath.entries()).map(([path, route]) => ({
      path,
      fullPath: router.buildLocation({ to: path as RoutePaths<typeof routeTree> }).href,
      parentId: route.parentRoute?.id,
      guards: route.beforeLoad ? 'Yes' : 'No',
      component: route.component?.name || 'Anonymous',
    }))

    Logger.info('Init', 'Router initialized', routes)

    // Expose debug utilities globally
    ;(window as any).__ROUTER_DEBUG__ = {
      router,
      routes: routeTree,
      logger: Logger,
      paths: routes,
      env: ENV,
      config: CONFIG,
      utils: { RoutePerformance },
    }

    // Monitor route changes
    router.subscribe('onBeforeLoad', ({ location }) => {
      Logger.debug('Navigation', 'Route change started', location)
      RoutePerformance.start(location.pathname)
    })

    router.subscribe('onResolved', ({ location }) => {
      Logger.debug('Navigation', 'Route change completed', location)
      RoutePerformance.end(location.pathname)
    })
  } catch (error) {
    Logger.error('Init', 'Failed to initialize debug utilities', error)
  }
}

// -------------------------
//     TYPE DECLARATIONS
// -------------------------
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export type AppRouter = typeof router
export type AppRouteTree = typeof routeTree
export type AppRoutePaths = RoutePaths<AppRouteTree>
