import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import { Header } from '@/components/header'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const location = useLocation()
  
  const noHeaderPages = ['/login', '/signup', '/email-verification', '/reset-password', '/request-password']
  const shouldShowHeader = !noHeaderPages.includes(location.pathname)

  return (
    <div className="min-h-screen">
      {shouldShowHeader && <Header />}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

