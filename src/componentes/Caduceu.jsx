// Caduceu — símbolo da Contabilidade (bastão, asas e duas serpentes), em traço dourado
export default function Caduceu({ className = "", cor = "var(--destaque)" }) {
  return (
    <svg className={className} viewBox="0 0 100 150" role="img" aria-label="Caduceu, símbolo da Contabilidade">
      <g fill="none" stroke={cor} strokeLinecap="round" strokeLinejoin="round">
        <line x1="50" y1="20" x2="50" y2="142" strokeWidth="4.5" />
        <path strokeWidth="3" d="M46 30 C 36 20, 20 16, 4 20 C 12 25, 18 27, 24 29 C 15 31, 9 34, 6 38 C 17 39, 27 37, 34 35 C 28 38, 24 41, 22 45 C 32 44, 41 40, 46 36" />
        <path strokeWidth="3" d="M54 30 C 64 20, 80 16, 96 20 C 88 25, 82 27, 76 29 C 85 31, 91 34, 94 38 C 83 39, 73 37, 66 35 C 72 38, 76 41, 78 45 C 68 44, 59 40, 54 36" />
        <path strokeWidth="4" d="M40 50 C 26 56, 30 70, 50 76 C 72 82, 72 98, 50 104 C 32 109, 32 122, 46 128" />
        <path strokeWidth="4" d="M60 50 C 74 56, 70 70, 50 76 C 28 82, 28 98, 50 104 C 68 109, 68 122, 54 128" />
      </g>
      <circle cx="50" cy="12" r="7" fill={cor} />
      <circle cx="40" cy="49" r="4.5" fill={cor} />
      <circle cx="60" cy="49" r="4.5" fill={cor} />
    </svg>
  );
}
