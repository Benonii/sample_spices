import { createFileRoute } from '@tanstack/react-router'
import RequestPasswordPage from '@/pages/RequestPassword'

export const Route = createFileRoute('/request-password')({
  component: RequestPasswordPage,
})