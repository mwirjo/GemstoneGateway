import { resolve } from "path";
import { defineConfig } from "vite";


export default defineConfig({
  root: "src/",
  server: {
    port: 5173,
    cors: true
  },

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        dragon: resolve(__dirname, "src/dragon/index.html"),
        formula: resolve(__dirname, "src/formula/index.html"),
        guess: resolve(__dirname,"src/guess/index.html",),
        learn: resolve(__dirname, "src/learn/index.html"),
        mineral: resolve(__dirname, "src/mineral/index.html"),
        mineral_listing: resolve(__dirname, "src/minerallist/index.html"),
        macro_theory: resolve(__dirname, "src/macrotheory/index.html"),
        privacy: resolve(__dirname, "src/privacy.html"),
        terms: resolve(__dirname, "src/terms.html"),
      },

    },
  },
});
