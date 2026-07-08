import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const phpTarget = env.VITE_PHP_BACKEND_URL || 'http://localhost:8000'
  // Set VITE_BASE=/your-subfolder/ when the site is not at the domain root.
  const base = env.VITE_BASE || '/'
  const proxy = {
    '/api': { target: phpTarget, changeOrigin: true },
    '/uploads': { target: phpTarget, changeOrigin: true },
  }

  const cssFirstPlugin = {
    name: 'css-first',
    transformIndexHtml(html) {
      const linkMatch = html.match(/<link rel="stylesheet"[^>]+>/)
      const scriptMatch = html.match(/<script type="module"[^>]+><\/script>/)
      if (!linkMatch || !scriptMatch) return html
      const withoutBoth = html
        .replace(linkMatch[0], '')
        .replace(scriptMatch[0], '')
      return withoutBoth.replace(
        '</head>',
        `    ${linkMatch[0]}\n    ${scriptMatch[0]}\n  </head>`,
      )
    },
  }

  return {
    base,
    plugins: [react(), cssFirstPlugin],
    server: { proxy },
    // `vite preview` does not use `server.proxy` unless duplicated here.
    preview: { proxy },
  }
})
