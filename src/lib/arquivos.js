// Leitura das tabelas oficiais publicadas junto com o site (public/dados).
// Ficam guardadas na memória depois da primeira leitura.
const cache = {};

export async function carregarTabela(nome) {
  if (!cache[nome]) {
    cache[nome] = fetch(`${import.meta.env.BASE_URL}dados/${nome}.json`).then((r) => {
      if (!r.ok) throw new Error(`Não foi possível carregar ${nome}.json`);
      return r.json();
    });
  }
  return cache[nome];
}

// Ordena códigos contábeis numericamente (1.10 vem depois de 1.9)
export const chaveCodigo = (c) => c.split(".").map((n) => n.padStart(3, "0")).join(".");

// Remove acentos para buscas
export const semAcento = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
