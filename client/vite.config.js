    // vite.config.js
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';

    export default defineConfig({
      plugins: [react()],
      server: {
        port: 5173, // Default Vite port
        proxy: {
          '/api': {
            target: 'http://localhost:5000', // Your Express server
            changeOrigin: true,
            secure: false,
          },
          '/socket.io': { // Proxy for Socket.io
            target: 'ws://localhost:5000',
            ws: true,
            changeOrigin: true,
            secure: false,
          },
        },
      },
    });
    