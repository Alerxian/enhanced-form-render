import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // 开发服务器端口
    proxy: {
      // 代理所有以 /api 开头的请求到 localhost:3000
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ""), // 移除 /api 前缀
      },
    },
  },
});
