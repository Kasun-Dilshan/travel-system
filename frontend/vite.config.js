import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const phpTarget = env.VITE_PHP_BACKEND_URL || 'http://localhost:8000'
  const proxy = {
    '/api': { target: phpTarget, changeOrigin: true },
    '/uploads': { target: phpTarget, changeOrigin: true },
  }

  return {
    plugins: [react()],
    server: { proxy },
    // `vite preview` does not use `server.proxy` unless duplicated here.
    preview: { proxy },
  }
})
