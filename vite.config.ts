import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  optimizeDeps: {
    exclude: [
      '@remotion/bundler',
      '@remotion/renderer',
      '@rspack/core',
      '@rspack/binding',
    ],
  },
  ssr: {
    noExternal: [],
    external: [
      '@remotion/bundler',
      '@remotion/renderer',
      '@rspack/core',
      '@rspack/binding',
    ],
  },
})

export default config
