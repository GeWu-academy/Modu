import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: "admin",
      filename: "remoteEntry.js",
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // react/react-dom 由 Module Federation 的 share 机制管理，不能手动分包，
        // 否则会打乱 share 初始化顺序（Cannot access 'u' before initialization）。
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }
          if (id.includes("@radix-ui")) {
            return "vendor-radix";
          }
          if (id.includes("lucide-react")) {
            return "vendor-lucide";
          }
          if (id.includes("gsap")) {
            return "vendor-gsap";
          }
          if (id.includes("echarts") || id.includes("zrender")) {
            return "vendor-echarts";
          }
        },
      },
    },
  },
});
