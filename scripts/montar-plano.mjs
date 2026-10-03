// Gera public/dados/plano-contas.json: plano oficial unificado do CTC (decisão 3, 03/10/2026)
// Base: 292 contas da CB (SECCHH) + 3 contas da CI + nomes da Unidade II em 3.3.01, 3.3.02, 7.1.11, 7.1.12
// (os caminhos abaixo são das cópias dos projetos CB, CI e Unidade II usadas na análise; o resultado já está em public/dados/plano-contas.json)
import fs from 'node:fs';
const cb = (await import('/home/claude/profjorgerg-gif/sistema-contabil-react/src/contas.js')).CONTAS;
const irmao = c => cb.find(x => x.codigo === c);
const extras = [
  { ...irmao('1.2.3.56'), codigo: '1.2.3.57', nome: '(-) Depreciação Acumulada Equipamentos de Informática' },
  { ...irmao('4.2.05'), codigo: '4.2.06', nome: '(-) Devoluções de Vendas' },
  { ...irmao('5.1.12'), codigo: '5.1.13', nome: 'Despesa com PECLD (Perdas Estimadas em Créditos de Liquidação Duvidosa)' },
];
const nomes = {
  '3.3.01': 'Ajustes de Avaliação — Ativos',
  '3.3.02': 'Ajustes de Avaliação — Passivos',
  '7.1.11': 'Lucro do Exercício',
  '7.1.12': 'Prejuízo do Exercício',
};
const destino = g => ({ '1': 'BP', '2': 'BP', '3': 'BP', '4': 'DRE', '5': 'DRE', '6': 'DRE', '7': 'ARE' })[g];
const ordem = c => c.split('.').map(n => n.padStart(3, '0')).join('.');
const plano = [...cb, ...extras]
  .map(c => ({ ...c, nome: nomes[c.codigo] || c.nome, destino: destino(c.codigo[0]) }))
  .sort((a, b) => ordem(a.codigo).localeCompare(ordem(b.codigo)));
fs.writeFileSync('public/dados/plano-contas.json', JSON.stringify(plano));
console.log('contas:', plano.length, '| exemplo:', JSON.stringify(plano.find(c => c.codigo === '1.2.3.57')));
