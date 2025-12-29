import { createFileRoute } from '@tanstack/react-router'
import ProductDetail from '@/pages/ProductDetail'

export const Route = createFileRoute('/product/$productId')({
  component: ProductDetail,
  validateSearch: (search: Record<string, unknown>) => {
    return search
  },
})
