import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://api.jayeshkrishna.me",
        changeOrigin: true,
      },
      "/uploads": {
        target: "https://api.jayeshkrishna.me",
        changeOrigin: true,
      },
    },
  },
});
