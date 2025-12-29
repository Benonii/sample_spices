import { createFileRoute } from '@tanstack/react-router'
import ResetPasswordPage from '@/pages/ResetPassword'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || undefined,
    }
  },
})