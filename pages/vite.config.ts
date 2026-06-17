import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/").at(1) ?? "react-render-budget";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? `/${repositoryName}/` : "/",
  build: {
    outDir: "../pages-dist",
    emptyOutDir: true,
  },
  plugins: [react()],
  root: "pages",
});
