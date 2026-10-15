import { useEffect, useMemo, useState } from 'react'
import { UNITS, ALL_LESSONS } from './data.js'
import { load, save, finishLesson, resetAll, norm, MAX_HEARTS } from './store.js'
import Dragon from './Dragon.jsx'

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b }

export default function App() {
  const [st, setSt] = useState(load)
  const [screen, setScreen] = useState({ name: 'home' })
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

function Lesson({ lesson, hearts, onHeart, onQuit, onFail, onDone }) {
  const exercises = lesson.exercises
  const [i, setI] = useState(0)
  const [answer, setAnswer] = useState(null)   // valor atual do usuário
  const [feedback, setFeedback] = useState(null) // {ok, correct}
  const [mistakes, setMistakes] = useState(0)
  const [startT] = useState(Date.now())
  const ex = exercises[i]

  const correctText = (e) => e.type === 'mc' ? e.answer : e.type === 'build' ? e.words.join(' ') : e.type === 'type' ? e.answers[0] : ''
  const check = () => {
    let ok
    if (ex.type === 'mc') ok = answer === ex.answer
    if (ex.type === 'build') ok = norm((answer || []).map(w => w.w).join(' ')) === norm(ex.words.join(' '))
    if (ex.type === 'type') ok = ex.answers.some(a => norm(a) === norm(answer || ''))
    if (ex.type === 'match') ok = true
    if (!ok) { setMistakes(m => m + 1); onHeart() }
    setFeedback({ ok, correct: correctText(ex) })
  }
  const next = () => {
    if (!feedback.ok && hearts <= 0) return onFail()
    if (i + 1 >= exercises.length) {
      const xp = 10 + (mistakes === 0 ? 5 : 0)
      return onDone({ xp, mistakes, total: exercises.length, secs: Math.round((Date.now() - startT) / 1000), perfect: mistakes === 0 })
    }
    setI(i + 1); setAnswer(null); setFeedback(null)
  }
  const canCheck = ex.type === 'mc' ? !!answer : ex.type === 'build' ? answer?.length > 0 : ex.type === 'type' ? !!answer?.trim() : answer === 'done'

  useEffect(() => {
    const h = (e) => { if (e.key === 'Enter') { if (feedback) next(); else if (canCheck) check() } }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  })

  return (
    <div className="lesson">
      <div className="lesson-top">
        <button className="x" onClick={() => confirm('Sair da lição? Você perderá o progresso dela.') && onQuit()}>✕</button>
        <div className="progress"><div style={{ width: `${((i + (feedback ? 1 : 0)) / exercises.length) * 100}%` }} /></div>
        <span className="stat hearts">❤️ {hearts}</span>
      </div>
      <div className="exercise" key={i}>
        {ex.type === 'mc' && <MC ex={ex} value={answer} set={setAnswer} locked={!!feedback} />}
        {ex.type === 'build' && <Build ex={ex} value={answer || []} set={setAnswer} locked={!!feedback} />}
        {ex.type === 'type' && <TypeIt ex={ex} value={answer || ''} set={setAnswer} locked={!!feedback} />}
        {ex.type === 'match' && <Match ex={ex} onWrong={() => { setMistakes(m => m + 1); onHeart() }} onDone={() => setAnswer('done')} hearts={hearts} onFail={onFail} />}
      </div>
      <div className={`sheet ${feedback ? (feedback.ok ? 'ok' : 'bad') : ''}`}>
        {feedback && <div className="fb">
          <div className="fb-title">{feedback.ok ? ['Excelente! 🔥', 'Muito bem!', 'Perfeito!', 'Kessa! Isso aí!'][i % 4] : 'Resposta correta:'}</div>
          {!feedback.ok && <div className="fb-correct">{feedback.correct}</div>}
        </div>}
        <button className={`btn ${feedback ? (feedback.ok ? 'primary' : 'danger') : 'primary'}`} disabled={!feedback && !canCheck}
          onClick={feedback ? next : check}>{feedback ? 'CONTINUAR' : 'VERIFICAR'}</button>
      </div>
    </div>
  )
}

function Prompt({ title, text }) {
  return <>
    <h2 className="ex-title">{title}</h2>
    {text && <div className="prompt"><Dragon size={64} /><div className="bubble">{text}</div></div>}
  </>
}

function MC({ ex, value, set, locked }) {
  const opts = useMemo(() => shuffle(ex.options), [ex])
  return <>
    <Prompt title="Escolha a resposta certa" text={ex.q} />
    <div className="options">
      {opts.map((o, k) => <button key={o} disabled={locked} className={`opt ${value === o ? 'sel' : ''}`} onClick={() => set(o)}>
        <span className="key">{k + 1}</span>{o}</button>)}
    </div>
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
        onClick={() => set([...value, b])}>{b.w}</button>)}
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
    if (ok) { const m = [...matched, sel.l]; setMatched(m); if (m.length === ex.pairs.length) onDone() }
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
      <div>{right.map(v => <button key={v} className={cls('r', v)} disabled={doneR.has(v)} onClick={() => setSel(s => ({ ...s, r: v }))}>{v}</button>)}</div>
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
