// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";


export default defineConfig({
  plugins: [react({fastRefresh: true,})].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@common": path.resolve(__dirname, "./src/common"),
      "@components": path.resolve(__dirname, "./src/common/components/"),
      "@constants/": path.resolve(__dirname, "./src/common/constants/"),
      "@context": path.resolve(__dirname, "./src/common/context/"),
      "@hooks": path.resolve(__dirname, "./src/common/hooks/"),
      "@lib": path.resolve(__dirname, "./src/common/lib/"),
      "@stores": path.resolve(__dirname, "./src/common/stores/"),
      "@styles": path.resolve(__dirname, "./src/common/styles/"),
      "@types": path.resolve(__dirname, "./src/common/types/"),
      "@utils": path.resolve(__dirname, "./src/common/utils/"),
      "@modules": path.resolve(__dirname, "./src/modules/"),
      "@home": path.resolve(__dirname, "./src/modules/home/"),
      "@dashboard": path.resolve(__dirname, "./src/modules/dashboard/"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@pages": path.resolve(__dirname, "./src/pages/"),
      "@routes": path.resolve(__dirname, "./src/routes/router.tsx"),
      "@public": path.resolve(__dirname, "./public")
    }
  }
});