import { createFileRoute } from '@tanstack/react-router'
import Signup from '@/pages/Signup'

// @ts-ignore - during editor typecheck without the Vite plugin, this generic is undefined
export const Route = createFileRoute('/signup')({
  component: Signup,
})
