import { createFileRoute } from '@tanstack/react-router'
import Products from '@/pages/Products'

// @ts-ignore - during editor typecheck without the Vite plugin, this generic is undefined
export const Route = createFileRoute('/home')({
  component: Products,
})
