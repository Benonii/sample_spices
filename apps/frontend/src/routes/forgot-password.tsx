import { createFileRoute } from '@tanstack/react-router'
import RequestPasswordReset from '@/pages/RequestPasswordReset'

export const Route = createFileRoute('/forgot-password')({
  component: RequestPasswordReset,
});
