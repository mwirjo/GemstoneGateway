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
        dragon: resolve(__dirname, "src/Dragon/index.html"),
        formula: resolve(__dirname, "src/FormulaMode/index.html"),
        guess: resolve(__dirname,"src/FormulaMode/index.html",),
        learn: resolve(__dirname, "src/LearnMode/index.html"),
        mineral: resolve(__dirname, "src/mineralPages/index.html"),
        mineral_listing: resolve(__dirname, "src/mineralListing/index.html"),
        macro_theory: resolve(__dirname, "src/MacroscopicTheory/index.html"),
        privacy: resolve(__dirname, "src/privacy.html"),
        terms: resolve(__dirname, "src/terms.html"),
      },

    },
  },
});
