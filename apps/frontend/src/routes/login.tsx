import { createFileRoute, redirect } from '@tanstack/react-router'
import Login from '@/pages/Login'
import { authClient } from '@/lib/authClient'

// @ts-ignore - during editor typecheck without the Vite plugin, this generic is undefined
export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const { data } = await authClient.getSession()
    if (data?.session) {
      throw redirect({ to: '/' })
    }
  },
  component: Login,
})
