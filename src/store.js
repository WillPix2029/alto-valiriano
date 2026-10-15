const KEY = 'zaldrizes-progresso-v1'
export const MAX_HEARTS = 5
const REFILL_MS = 20 * 60 * 1000
export const today = (d = new Date()) => d.toLocaleDateString('sv-SE')
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return today(d) }

const fresh = () => ({ xp: 0, hearts: MAX_HEARTS, heartsAt: Date.now(), streak: 0, lastDay: null, completed: {}, xpByDay: {} })

export function load() {
  let s
  try { s = { ...fresh(), ...JSON.parse(localStorage.getItem(KEY)) } } catch { s = fresh() }
  // recarga passiva de corações
  if (s.hearts < MAX_HEARTS) {
    const gained = Math.floor((Date.now() - s.heartsAt) / REFILL_MS)
    if (gained > 0) { s.hearts = Math.min(MAX_HEARTS, s.hearts + gained); s.heartsAt = Date.now() }
  } else s.heartsAt = Date.now()
  // ofensiva perdida?
  if (s.lastDay && s.lastDay !== today() && s.lastDay !== yesterday()) s.streak = 0
  return s
}
export const save = (s) => localStorage.setItem(KEY, JSON.stringify(s))
export function finishLesson(s, lessonId, xp) {
  const t = today()
  const streak = s.lastDay === t ? s.streak : s.lastDay === yesterday() ? s.streak + 1 : 1
  return { ...s, xp: s.xp + xp, streak, lastDay: t,
    completed: { ...s.completed, [lessonId]: (s.completed[lessonId] || 0) + 1 },
    xpByDay: { ...s.xpByDay, [t]: (s.xpByDay[t] || 0) + xp } }
}
export const resetAll = () => { localStorage.removeItem(KEY); return fresh() }
export { norm } from './words.js'
