import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { openAI } from "./src/components/Url";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: openAI,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
