import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// O site é publicado no domínio próprio https://ctccontabil.com.br/
// (o endereço antigo do GitHub Pages redireciona para ele), por isso os caminhos partem da raiz.
export default defineConfig({
  plugins: [react()],
  base: "/",
});
