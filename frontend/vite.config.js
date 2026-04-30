import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://13.126.126.158:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://13.126.126.158:5000",
        changeOrigin: true,
      },
    },
  },
});
