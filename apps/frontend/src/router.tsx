import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    defaultPreload: 'intent',
    Wrap: (props: { children: React.ReactNode }) => <>{props.children}</>,
  })

  return router
}
