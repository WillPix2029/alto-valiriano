const MKEY = 'zaldrizes-mudo'
let muted = localStorage.getItem(MKEY) === '1'
export const isMuted = () => muted
export const setMuted = (m) => { muted = m; localStorage.setItem(MKEY, m ? '1' : '0'); if (m) window.speechSynthesis?.cancel() }

let voice = null
function pickVoice() {
  const vs = window.speechSynthesis?.getVoices() || []
  const pref = ['it-IT', 'it', 'es-ES', 'es', 'pt-PT', 'pt-BR', 'pt']
  for (const p of pref) { const v = vs.find(v => v.lang?.toLowerCase().startsWith(p.toLowerCase())); if (v) return v }
  return vs[0] || null
}
if (typeof window !== 'undefined' && window.speechSynthesis) {
  voice = pickVoice()
  window.speechSynthesis.onvoiceschanged = () => { voice = pickVoice() }
}
export function speak(text, { force = false, slow = false } = {}) {
  if ((muted && !force) || !window.speechSynthesis) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text.replace(/[?!]/g, ''))
    if (voice) { u.voice = voice; u.lang = voice.lang } else u.lang = 'it-IT'
    u.rate = slow ? 0.55 : 0.8
    window.speechSynthesis.speak(u)
  } catch { /* sem áudio */ }
}

let ctx = null
function tone(freq, start, dur, type = 'sine', vol = 0.18) {
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = type; o.frequency.value = freq
  g.gain.setValueAtTime(0, ctx.currentTime + start)
  g.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.02)
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur)
  o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + start); o.stop(ctx.currentTime + start + dur + 0.05)
}
export function sfx(kind) {
  if (muted) return
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    if (kind === 'ok') { tone(660, 0, 0.15); tone(990, 0.1, 0.25) }
    else if (kind === 'bad') { tone(180, 0, 0.3, 'sawtooth', 0.08); tone(140, 0.12, 0.3, 'sawtooth', 0.08) }
    else if (kind === 'win') { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle')) }
    else if (kind === 'tap') tone(880, 0, 0.05, 'sine', 0.05)
  } catch { /* sem áudio */ }
}
