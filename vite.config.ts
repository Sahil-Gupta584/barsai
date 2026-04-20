import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    nitroV2Plugin({
      preset: "vercel",
      compatibilityDate: "2025-10-26",
    }),
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
