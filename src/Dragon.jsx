export default function Dragon({ size = 120, mood = 'happy' }) {
  const sad = mood === 'sad'
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={`dragon ${mood}`} aria-label="Dragãozinho">
      <path d="M22 70 Q4 52 14 34 Q26 48 36 52Z" fill="#ff9f43" stroke="#c75400" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M98 70 Q116 52 106 34 Q94 48 84 52Z" fill="#ff9f43" stroke="#c75400" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M88 96 Q110 100 108 82 Q114 86 112 94" fill="none" stroke="#e63946" strokeWidth="6" strokeLinecap="round"/>
      <ellipse cx="60" cy="74" rx="34" ry="32" fill="#e63946" stroke="#a8202c" strokeWidth="3"/>
      <ellipse cx="60" cy="84" rx="20" ry="18" fill="#ffd27f"/>
      <path d="M52 76h16M50 84h20M52 92h16" stroke="#f0b04a" strokeWidth="2"/>
      <path d="M40 30 L44 14 L52 28Z M80 30 L76 14 L68 28Z" fill="#ffd27f" stroke="#c75400" strokeWidth="2" strokeLinejoin="round"/>
      <ellipse cx="60" cy="44" rx="28" ry="22" fill="#e63946" stroke="#a8202c" strokeWidth="3"/>
      <ellipse cx="49" cy="42" rx="7" ry={sad ? 4 : 8} fill="#fff"/>
      <ellipse cx="71" cy="42" rx="7" ry={sad ? 4 : 8} fill="#fff"/>
      <circle cx="50" cy={sad ? 44 : 43} r="4" fill="#2b1d3a"/>
      <circle cx="72" cy={sad ? 44 : 43} r="4" fill="#2b1d3a"/>
      <circle cx="51.5" cy="41" r="1.4" fill="#fff"/><circle cx="73.5" cy="41" r="1.4" fill="#fff"/>
      <circle cx="40" cy="52" r="4" fill="#ff8fa3" opacity=".7"/><circle cx="80" cy="52" r="4" fill="#ff8fa3" opacity=".7"/>
      {sad
        ? <path d="M53 58 Q60 52 67 58" fill="none" stroke="#2b1d3a" strokeWidth="3" strokeLinecap="round"/>
        : <path d="M52 54 Q60 62 68 54" fill="#7a1020" stroke="#2b1d3a" strokeWidth="3" strokeLinecap="round"/>}
      <path d="M50 102 v8 M70 102 v8" stroke="#a8202c" strokeWidth="7" strokeLinecap="round"/>
    </svg>
  )
}
