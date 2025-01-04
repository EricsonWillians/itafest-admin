// src/main.tsx
import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth'
import { router } from '@/lib/router'
import { Toaster } from 'sonner'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Import i18n configuration
import './lib/i18n'

import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
  logger: {
    log: (...args) => {
      console.log('🔵 [Query]', ...args)
    },
    warn: (...args) => {
      console.warn('🟡 [Query]', ...args)
    },
    error: (...args) => {
      console.error('🔴 [Query]', ...args)
    },
  },
})

function Root() {
  return (
    <StrictMode>
      <Suspense fallback={<div>Loading...</div>}>
        <ThemeProvider defaultTheme="dark">
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <RouterProvider router={router} />
              <ReactQueryDevtools initialIsOpen={false} />
              <Toaster />
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </Suspense>
    </StrictMode>
  )
}

const container = document.getElementById('root')
if (!container) throw new Error('Could not find root element')

const root = createRoot(container)
root.render(<Root />)