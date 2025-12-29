import { createFileRoute } from '@tanstack/react-router'
import EmailVerification from '@/pages/EmailVerification'

// @ts-ignore - during editor typecheck without the Vite plugin, this generic is undefined
export const Route = createFileRoute('/email-verification')({
  component: EmailVerification,
})