import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // If you had an esbuild block here, remove the "jsx" key
  esbuild: {
    // Use 'loader' if you need to specify jsx for specific files
    loader: 'jsx', 
    include: /src\/.*\.jsx?$/,
    exclude: [],
  }
})