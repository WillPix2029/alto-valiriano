import { useEffect, useMemo, useState } from 'react'
import { UNITS, ALL_LESSONS } from './data.js'
import { load, save, finishLesson, resetAll, norm, MAX_HEARTS } from './store.js'
import Dragon from './Dragon.jsx'
import { WORDS, GLOSS, isHV, pronounce } from './words.js'
import { speak, sfx, isMuted, setMuted } from './audio.js'

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

export default function App() {
  const [st, setSt] = useState(load)
  const [screen, setScreen] = useState({ name: 'home' })
  const [mute, setMute] = useState(isMuted())
  useEffect(() => save(st), [st])

  const isUnlocked = (idx) => idx === 0 || !!st.completed[ALL_LESSONS[idx - 1].id]
  const start = (lesson) => {
    if (st.hearts <= 0) return setScreen({ name: 'noHearts' })
    setScreen({ name: 'lesson', lesson })
  }

  if (screen.name === 'lesson')
    return <Lesson lesson={screen.lesson} hearts={st.hearts}
      onHeart={() => setSt(s => ({ ...s, hearts: Math.max(0, s.hearts - 1), heartsAt: s.hearts === MAX_HEARTS ? Date.now() : s.heartsAt }))}
      onQuit={() => setScreen({ name: 'home' })}
      onFail={() => setScreen({ name: 'noHearts' })}
      onDone={(r) => { setSt(s => finishLesson(s, screen.lesson.id, r.xp)); setScreen({ name: 'complete', ...r }) }} />
  if (screen.name === 'complete') return <Complete {...screen} streak={st.streak} onContinue={() => setScreen({ name: 'home' })} />
  if (screen.name === 'noHearts') return (
    <div className="center-screen">
      <Dragon size={140} mood="sad" />
      <h1>Sem corações! 💔</h1>
      <p>Os corações recarregam com o tempo (1 a cada 20 min). Ou pratique a lição de revisão para recuperar tudo.</p>
      <button className="btn primary" onClick={() => { setSt(s => ({ ...s, hearts: MAX_HEARTS })); setScreen({ name: 'home' }) }}>Praticar e recarregar ❤️</button>
      <button className="btn ghost" onClick={() => setScreen({ name: 'home' })}>Voltar</button>
    </div>)

  let idx = -1
  const currentIdx = ALL_LESSONS.findIndex((l, i) => isUnlocked(i) && !st.completed[l.id])
  return (
    <div className="app">
      <header className="topbar">
        <span className="flag" title="Alto Valiriano">🐉</span>
        <span className="stat streak" title="Ofensiva">🔥 {st.streak}</span>
        <span className="stat xp" title="XP total">⚡ {st.xp}</span>
        <span className="stat hearts" title="Corações">❤️ {st.hearts}</span>
        <button className="mute" onClick={() => { setMuted(!mute); setMute(!mute) }} aria-label="Som">{mute ? '🔇' : '🔊'}</button>
      </header>
      <main className="path">
        <div className="hero">
          <Dragon size={84} />
          <div className="bubble">Rytsas! Vamos aprender <b>Alto Valiriano</b> hoje?</div>
        </div>
        {UNITS.map(u => (
          <section key={u.id} className="unit">
            <div className="unit-banner" style={{ background: u.color, boxShadow: `0 4px 0 ${u.dark}` }}>
              <div><small>{u.title}</small><h2>{u.subtitle}</h2></div>
            </div>
            <div className="nodes">
              {u.lessons.map((l) => {
                idx++
                const i = idx, unlocked = isUnlocked(i), done = !!st.completed[l.id], current = i === currentIdx
                const offset = [0, 60, 0, -60][i % 4]
                return (
                  <div key={l.id} className="node-wrap" style={{ transform: `translateX(${offset}px)` }}>
                    {current && <div className="start-tag">COMEÇAR</div>}
                    <button className={`node ${unlocked ? 'open' : 'locked'} ${done ? 'done' : ''} ${current ? 'current' : ''}`}
                      style={unlocked ? { background: u.color, boxShadow: `0 6px 0 ${u.dark}` } : {}}
                      disabled={!unlocked} onClick={() => start({ ...l, unit: u })} aria-label={l.title}>
                      {unlocked ? (done ? '⭐' : l.icon) : '🔒'}
                    </button>
                    <div className="node-label">{l.title}{done && st.completed[l.id] > 1 ? ` ×${st.completed[l.id]}` : ''}</div>
                  </div>)
              })}
            </div>
          </section>
        ))}
        <footer className="foot">
          <p>Alto Valiriano é uma língua criada por David J. Peterson. App de estudo feito por fãs, sem fins lucrativos.</p>
          <button className="link" onClick={() => confirm('Apagar todo o progresso?') && setSt(resetAll())}>Reiniciar progresso</button>
        </footer>
      </main>
    </div>
  )
}

const TEST = typeof location !== 'undefined' && location.search.includes('teste')
const chunk = (a, n) => a.reduce((acc, x, i) => (i % n ? acc[acc.length - 1].push(x) : acc.push([x]), acc), [])
const rank = (e) => e.type === 'mc' && e.q.startsWith('O que') ? 0 : e.type === 'match' ? 1 : e.type === 'mc' ? 2 : e.type === 'build' ? 3 : 4

// Monta a lição: apresenta palavras em grupos (2–3), quiz de reconhecimento, depois produção
function buildSteps(lesson) {
  const words = (WORDS[lesson.id] || []).map(([hv, pt, emoji]) => ({ hv, pt, emoji }))
  const steps = []
  const seen = []
  for (const batch of chunk(words, 3)) {
    batch.forEach(w => { steps.push({ type: 'intro', w }); seen.push(w) })
    batch.slice(0, 2).forEach((w, k) => {
      // distratores: primeiro palavras já apresentadas, depois as demais da lição
      const others = [...shuffle(seen.filter(o => o !== w)), ...shuffle(words.filter(o => !seen.includes(o)))].slice(0, 3)
      if (k === 0) steps.push({ type: 'listen', w, options: shuffle([w, ...others].map(o => o.hv)), answer: w.hv })
      else steps.push({ type: 'rec', w, options: shuffle([w, ...others].map(o => o.pt)), answer: w.pt })
    })
  }
  return [...steps, ...[...lesson.exercises].sort((a, b) => rank(a) - rank(b))]
}

function Speaker({ text, big }) {
  return <span className="spk-wrap">
    <button className={`spk ${big ? 'big' : ''}`} onClick={(e) => { e.stopPropagation(); speak(text, { force: true }) }} aria-label="Ouvir">🔊</button>
    {big && <button className="spk slow" onClick={(e) => { e.stopPropagation(); speak(text, { force: true, slow: true }) }} aria-label="Ouvir devagar">🐢</button>}
  </span>
}

function HVText({ text }) {
  const [open, setOpen] = useState(null)
  useEffect(() => { if (open == null) return; const t = setTimeout(() => setOpen(null), 2500); return () => clearTimeout(t) }, [open])
  return <span className="hv">{text.split(' ').map((tok, k) => {
    const hint = GLOSS.get(norm(tok))
    return <span key={k} className={`tok ${hint ? 'hint' : ''}`} onClick={(e) => { e.stopPropagation(); if (hint) { setOpen(k); speak(tok) } }}>
      {tok}{open === k && <span className="tip">{hint}</span>}</span>
  }).reduce((a, x, k) => k ? [...a, ' ', x] : [x], [])}</span>
}

function RichQ({ q }) {
  return <>{q.split(/("[^"]+")/).map((part, k) => {
    const inner = part.startsWith('"') ? part.slice(1, -1) : null
    if (inner && isHV(inner)) return <span key={k}>"<HVText text={inner} />" <Speaker text={inner} /></span>
    return <span key={k}>{part}</span>
  })}</>
}

function Lesson({ lesson, hearts, onHeart, onQuit, onFail, onDone }) {
  const exercises = useMemo(() => buildSteps(lesson), [lesson])
  const [i, setI] = useState(0)
  const [answer, setAnswer] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [mistakes, setMistakes] = useState(0)
  const [startT] = useState(Date.now())
  const [mute, setMute] = useState(isMuted())
  const ex = exercises[i]
  const quizCount = exercises.filter(e => e.type !== 'intro').length

  const correctText = (e) => ['mc', 'listen', 'rec'].includes(e.type) ? e.answer : e.type === 'build' ? e.words.join(' ') : e.type === 'type' ? e.answers[0] : ''
  const check = () => {
    let ok
    if (['mc', 'listen', 'rec'].includes(ex.type)) ok = answer === ex.answer
    if (ex.type === 'build') ok = norm((answer || []).map(w => w.w).join(' ')) === norm(ex.words.join(' '))
    if (ex.type === 'type') ok = ex.answers.some(a => norm(a) === norm(answer || ''))
    if (ex.type === 'match') ok = true
    if (!ok) { setMistakes(m => m + 1); onHeart() }
    sfx(ok ? 'ok' : 'bad')
    const correct = correctText(ex)
    if (ok && isHV(correct)) speak(correct)
    setFeedback({ ok, correct })
  }
  const next = () => {
    if (feedback && !feedback.ok && hearts <= 0) return onFail()
    if (i + 1 >= exercises.length) {
      sfx('win')
      const xp = 10 + (mistakes === 0 ? 5 : 0)
      return onDone({ xp, mistakes, total: quizCount, secs: Math.round((Date.now() - startT) / 1000), perfect: mistakes === 0 })
    }
    setI(i + 1); setAnswer(null); setFeedback(null)
  }
  const isIntro = ex.type === 'intro'
  const canCheck = ['mc', 'listen', 'rec'].includes(ex.type) ? !!answer : ex.type === 'build' ? answer?.length > 0 : ex.type === 'type' ? !!answer?.trim() : answer === 'done'

  useEffect(() => {
    const h = (e) => { if (e.key === 'Enter') { e.preventDefault(); if (feedback || isIntro) next(); else if (canCheck) check() } }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  })

  return (
    <div className="lesson">
      <div className="lesson-top">
        <button className="x" onClick={() => confirm('Sair da lição? Você perderá o progresso dela.') && onQuit()} aria-label="Sair">✕</button>
        <div className="progress"><div style={{ width: `${((i + (feedback || isIntro ? 1 : 0)) / exercises.length) * 100}%` }} /></div>
        <button className="mute" onClick={() => { setMuted(!mute); setMute(!mute) }} aria-label="Som">{mute ? '🔇' : '🔊'}</button>
        <span className="stat hearts">❤️ {hearts}</span>
      </div>
      <div className="exercise" key={i} data-a={TEST ? JSON.stringify(ex.type === 'build' ? ex.words : ex.type === 'type' ? ex.answers[0] : ex.type === 'match' ? ex.pairs : ex.answer ?? null) : undefined}>
        {ex.type === 'intro' && <Intro w={ex.w} />}
        {ex.type === 'mc' && <MC ex={ex} value={answer} set={setAnswer} locked={!!feedback} />}
        {ex.type === 'listen' && <Listen ex={ex} value={answer} set={setAnswer} locked={!!feedback} />}
        {ex.type === 'rec' && <Rec ex={ex} value={answer} set={setAnswer} locked={!!feedback} />}
        {ex.type === 'build' && <Build ex={ex} value={answer || []} set={setAnswer} locked={!!feedback} />}
        {ex.type === 'type' && <TypeIt ex={ex} value={answer || ''} set={setAnswer} locked={!!feedback} />}
        {ex.type === 'match' && <Match ex={ex} onWrong={() => { setMistakes(m => m + 1); onHeart(); sfx('bad') }} onDone={() => setAnswer('done')} hearts={hearts} onFail={onFail} />}
      </div>
      <div className={`sheet ${feedback ? (feedback.ok ? 'ok' : 'bad') : ''}`}>
        {feedback && <div className="fb">
          <div className="fb-title">{feedback.ok ? ['Excelente! 🔥', 'Muito bem!', 'Perfeito!', 'Kessa! Isso aí!'][i % 4] : 'Resposta correta:'}</div>
          {!feedback.ok && <div className="fb-correct">{feedback.correct} {isHV(feedback.correct) && <Speaker text={feedback.correct} />}</div>}
        </div>}
        <button className={`btn ${feedback ? (feedback.ok ? 'primary' : 'danger') : 'primary'}`} disabled={!feedback && !isIntro && !canCheck}
          onClick={feedback || isIntro ? next : check}>{feedback || isIntro ? 'CONTINUAR' : 'VERIFICAR'}</button>
      </div>
    </div>
  )
}

function Intro({ w }) {
  useEffect(() => { const t = setTimeout(() => speak(w.hv), 350); return () => clearTimeout(t) }, [w])
  return <div className="intro">
    <div className="new-tag">✨ NOVA PALAVRA</div>
    <div className="intro-card">
      <div className="intro-emoji">{w.emoji}</div>
      <div className="intro-word">{w.hv}</div>
      <div className="intro-pron">🗣️ fala-se: <b>{pronounce(w.hv)}</b></div>
      <Speaker text={w.hv} big />
      <div className="intro-pt">{w.pt}</div>
    </div>
    <p className="intro-tip">Toque em 🔊 para ouvir de novo, 🐢 para ouvir devagar.</p>
  </div>
}

function Prompt({ title, text }) {
  return <>
    <h2 className="ex-title">{title}</h2>
    {text && <div className="prompt"><Dragon size={64} /><div className="bubble">{text}</div></div>}
  </>
}

function Options({ opts, value, set, locked, speakHV }) {
  return <div className="options">
    {opts.map((o, k) => <button key={o} disabled={locked} className={`opt ${value === o ? 'sel' : ''}`}
      onClick={() => { set(o); sfx('tap'); if (speakHV && isHV(o)) speak(o) }}>
      <span className="key">{k + 1}</span>{o}</button>)}
  </div>
}

function MC({ ex, value, set, locked }) {
  const opts = useMemo(() => shuffle(ex.options), [ex])
  useEffect(() => { const m = ex.q.match(/"([^"]+)"/); if (m && isHV(m[1])) { const t = setTimeout(() => speak(m[1]), 300); return () => clearTimeout(t) } }, [ex])
  return <>
    <Prompt title="Escolha a resposta certa" text={<RichQ q={ex.q} />} />
    <Options opts={opts} value={value} set={set} locked={locked} speakHV />
  </>
}

function Listen({ ex, value, set, locked }) {
  useEffect(() => { const t = setTimeout(() => speak(ex.answer), 300); return () => clearTimeout(t) }, [ex])
  return <>
    <h2 className="ex-title">Ouça e escolha o que você escutou</h2>
    <div className="listen-box"><Speaker text={ex.answer} big /></div>
    <Options opts={ex.options} value={value} set={set} locked={locked} />
  </>
}

function Rec({ ex, value, set, locked }) {
  useEffect(() => { const t = setTimeout(() => speak(ex.w.hv), 300); return () => clearTimeout(t) }, [ex])
  return <>
    <Prompt title="O que significa?" text={<span className="big-hv"><HVText text={ex.w.hv} /> <Speaker text={ex.w.hv} /></span>} />
    <Options opts={ex.options} value={value} set={set} locked={locked} />
  </>
}

function Build({ ex, value, set, locked }) {
  const bank = useMemo(() => shuffle([...ex.words, ...ex.extra].map((w, id) => ({ w, id }))), [ex])
  const used = new Set(value.map(v => v.id))
  return <>
    <Prompt title="Traduza esta frase" text={ex.pt} />
    <div className="answer-line">
      {value.map(v => <button key={v.id} className="chip" disabled={locked} onClick={() => set(value.filter(x => x.id !== v.id))}>{v.w}</button>)}
    </div>
    <div className="bank">
      {bank.map(b => <button key={b.id} className={`chip ${used.has(b.id) ? 'ghost-chip' : ''}`} disabled={locked || used.has(b.id)}
        onClick={() => { set([...value, b]); speak(b.w) }}>{b.w}</button>)}
    </div>
  </>
}

function TypeIt({ ex, value, set, locked }) {
  return <>
    <Prompt title="Escreva em Alto Valiriano" text={ex.pt} />
    <textarea className="type-box" autoFocus value={value} disabled={locked} placeholder="Digite aqui… (acentos como ā, ñ são opcionais)"
      onChange={e => set(e.target.value.replace(/\n/g, ''))} />
  </>
}

function Match({ ex, onWrong, onDone, hearts, onFail }) {
  const left = useMemo(() => shuffle(ex.pairs.map(p => p[0])), [ex])
  const right = useMemo(() => shuffle(ex.pairs.map(p => p[1])), [ex])
  const [sel, setSel] = useState({ l: null, r: null })
  const [matched, setMatched] = useState([])
  const [wrong, setWrong] = useState(null)
  useEffect(() => {
    if (sel.l == null || sel.r == null) return
    const ok = ex.pairs.some(p => p[0] === sel.l && p[1] === sel.r)
    if (ok) { sfx('tap'); const m = [...matched, sel.l]; setMatched(m); if (m.length === ex.pairs.length) onDone() }
    else { setWrong({ ...sel }); onWrong(); if (hearts - 1 <= 0) setTimeout(onFail, 600); setTimeout(() => setWrong(null), 500) }
    setSel({ l: null, r: null })
  }, [sel])
  const doneR = new Set(ex.pairs.filter(p => matched.includes(p[0])).map(p => p[1]))
  const cls = (side, v) => {
    const isDone = side === 'l' ? matched.includes(v) : doneR.has(v)
    return `opt pair ${isDone ? 'matched' : ''} ${sel[side] === v ? 'sel' : ''} ${wrong && wrong[side] === v ? 'wrong' : ''}`
  }
  return <>
    <Prompt title="Toque nos pares correspondentes" />
    <div className="match">
      <div>{left.map(v => <button key={v} className={cls('l', v)} disabled={matched.includes(v)} onClick={() => setSel(s => ({ ...s, l: v }))}>{v}</button>)}</div>
      <div>{right.map(v => <button key={v} className={cls('r', v)} disabled={doneR.has(v)} onClick={() => { speak(v); setSel(s => ({ ...s, r: v })) }}>🔊 {v}</button>)}</div>
    </div>
  </>
}

function Complete({ xp, mistakes, total, secs, perfect, streak, onContinue }) {
  const acc = Math.round(((total * 1) / (total + mistakes)) * 100)
  return (
    <div className="center-screen complete">
      <div className="confetti">🔥✨🐉✨🔥</div>
      <Dragon size={150} />
      <h1>Lição concluída!</h1>
      <p>{perfect ? 'Lição perfeita! Nenhum erro. Drakarys! 🔥' : 'Muito bem! Continue praticando.'}</p>
      <div className="cards">
        <div className="card gold"><small>XP TOTAL</small><b>⚡ {xp}</b></div>
        <div className="card green"><small>PRECISÃO</small><b>🎯 {acc}%</b></div>
        <div className="card blue"><small>TEMPO</small><b>⏱ {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</b></div>
      </div>
      <div className="streak-note">🔥 Ofensiva de {streak} {streak === 1 ? 'dia' : 'dias'}!</div>
      <button className="btn primary" onClick={onContinue}>CONTINUAR</button>
    </div>)
}
