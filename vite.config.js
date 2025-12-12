import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  // REMOVED root: "src/" - breaks deployments
  server: {
    port: 5173,
    cors: true
  },
  build: {
    outDir: "dist",  // Simple, standard path
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        dragon: resolve(__dirname, "src/dragon/index.html"),  // lowercase
        formula: resolve(__dirname, "src/formula_mode/index.html"),  // fixed path
        guess: resolve(__dirname, "src/guess_mode/index.html"),  // fixed path  
        learn: resolve(__dirname, "src/learn_mode/index.html"),  // lowercase
        mineral: resolve(__dirname, "src/mineral_pages/index.html"),
        mineral_listing: resolve(__dirname, "src/mineral_isting/index.html"),
        macro_theory: resolve(__dirname, "src/macroscopic_theory/index.html"),
        privacy: resolve(__dirname, "src/privacy.html"),
        terms: resolve(__dirname, "src/terms.html")
      }
    }
  },
  base: "/"  // Inside config, not separate export
});
