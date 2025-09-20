import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import vercel from "vite-plugin-vercel";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Polyfill __dirname in ESM context (Node >=16)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    cors: { origin: ["*"] },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), tailwindcss(), vercel()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  vercel: {
    defaultSupportsResponseStreaming: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes("react") || id.includes("react-dom")) {
            return "react";
          }
          
          // UI libraries
          if (id.includes("@radix-ui") || id.includes("lucide-react")) {
            return "ui";
          }
          
          // Audio libraries
          if (id.includes("tone") || id.includes("wavesurfer") || id.includes("audio-buffer-utils")) {
            return "audio";
          }
          
          
          // Individual app chunks for better code splitting
          if (id.includes("src/apps/ipod")) return "app-ipod";
          if (id.includes("src/apps/textedit")) return "app-textedit";
          if (id.includes("src/apps/terminal")) return "app-terminal";
          if (id.includes("src/apps/finder")) return "app-finder";
          if (id.includes("src/apps/videos")) return "app-videos";
          if (id.includes("src/apps/memes")) return "app-memes";
          if (id.includes("src/apps/notepad")) return "app-notepad";
          if (id.includes("src/apps/todo")) return "app-todo";
          if (id.includes("src/apps/xlists")) return "app-xlists";
          if (id.includes("src/apps/readinglist")) return "app-readinglist";
          if (id.includes("src/apps/control-panels")) return "app-control-panels";
          if (id.includes("src/apps/minesweeper")) return "app-minesweeper";
          
          // Animation libraries
          if (id.includes("framer-motion")) {
            return "animation";
          }
          
          // Utilities
          if (id.includes("zustand") || id.includes("uuid") || id.includes("clsx")) {
            return "utils";
          }
        },
      },
    },
    sourcemap: false,
    minify: true,
  },
});
