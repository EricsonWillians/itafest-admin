// src/lib/router.tsx
import { 
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect
} from '@tanstack/react-router'
import { DashboardPage } from '@/pages/dashboard'
import { LoginPage } from '@/pages/auth/login'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

// Create a root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

// Login Route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

// Protected Layout Route
const protectedLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: DashboardLayout,
})

// Dashboard Route
const dashboardRoute = createRoute({
  getParentRoute: () => protectedLayout,
  path: '/dashboard',
  component: DashboardPage,
})

// Index route that redirects to dashboard
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Outlet />,
})

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  protectedLayout.addChildren([
    dashboardRoute,
  ])
])

// Create the router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// For maximum type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}