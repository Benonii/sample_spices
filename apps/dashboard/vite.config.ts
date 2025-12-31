import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import * as path from "path";

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.platform': '"browser"',
    'process.version': '"v16.0.0"',
    'process.browser': 'true',
    'process.nextTick': '(cb) => setTimeout(cb, 0)',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components/*": path.resolve(__dirname, "./src/components/*"),
      "@/pages/*": path.resolve(__dirname, "./src/pages/*"),
      "@/utils/*": path.resolve(__dirname, "./src/utils/*"),
      "@/contexts/*": path.resolve(__dirname, "./src/contexts/*"),
      "@/assets/*": path.resolve(__dirname, "./src/assets/*")
    },
  },
  optimizeDeps: {
    include: ['@refinedev/core', '@refinedev/antd', '@refinedev/react-router']
  }
});
