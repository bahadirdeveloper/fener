// Erişilebilirlik: font ölçeği + yüksek kontrast.
// CSS variable olarak root'a basıyoruz.

const KEY_SCALE = 'fener.fontScale.v1'
const KEY_CONTRAST = 'fener.contrast.v1'

export const SCALES = [
  { id: 's', label: 'S', value: 0.9 },
  { id: 'm', label: 'M', value: 1 },
  { id: 'l', label: 'L', value: 1.15 },
  { id: 'xl', label: 'XL', value: 1.35 }
]

export function getScale() {
  return localStorage.getItem(KEY_SCALE) || 'm'
}
export function setScale(id) {
  localStorage.setItem(KEY_SCALE, id)
  applyScale(id)
}
export function applyScale(id = getScale()) {
  const s = SCALES.find((x) => x.id === id)?.value ?? 1
  document.documentElement.style.setProperty('--font-scale', String(s))
  document.documentElement.style.fontSize = `${s * 16}px`
}

export function getContrast() {
  return localStorage.getItem(KEY_CONTRAST) === '1'
}
export function setContrast(on) {
  localStorage.setItem(KEY_CONTRAST, on ? '1' : '0')
  applyContrast(on)
}
export function applyContrast(on = getContrast()) {
  document.documentElement.classList.toggle('hc', on)
}

export function applyAll() {
  applyScale()
  applyContrast()
}
