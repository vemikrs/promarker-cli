import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  minify: false,
  target: 'node18',
  outDir: 'dist',
  splitting: false,
  sourcemap: true
})