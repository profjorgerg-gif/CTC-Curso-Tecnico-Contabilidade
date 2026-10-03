import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// O site é publicado em https://profjorgerg-gif.github.io/CTC-Curso-Tecnico-Contabilidade/
// por isso todos os caminhos partem desta pasta.
export default defineConfig({
  plugins: [react()],
  base: "/CTC-Curso-Tecnico-Contabilidade/",
});
