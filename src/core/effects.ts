// ═══════════════════════════════════════════
// TYPO — Effects Engine
// ═══════════════════════════════════════════
// Each effect function takes (progress 0-1, charIndex, totalChars, time, config)
// and returns CSS properties for that character.

import type { TypoEffect, TypoConfig } from '../types'

export interface CharStyle {
  opacity: number
  transform: string
  color?: string
  textShadow?: string
  filter?: string
  display?: string
  letterContent?: string // Override character
}

type EffectFn = (p: number, i: number, total: number, t: number, cfg: EffectCtx) => CharStyle

interface EffectCtx {
  duration: number
  stagger: number
  intensity: number
  mouseX: number
  mouseY: number
  charRects: DOMRect[]
  scrollProgress: number
}

function ease(t: number): number { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }
function easeBack(t: number): number { const c = 1.70158; return t * t * ((c + 1) * t - c) }
function easeElastic(t: number): number {
  if (t === 0 || t === 1) return t
  return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1
}
function clamp(v: number, a: number, b: number): number { return Math.max(a, Math.min(b, v)) }
function charProgress(globalP: number, i: number, total: number, stagger: number, duration: number): number {
  const charDelay = (i * stagger) / duration
  return clamp((globalP - charDelay) / (1 - charDelay * (total > 1 ? (total - 1) / total : 0) + 0.001), 0, 1)
}

const GLITCH_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテト01'

// ═══ THE 25 EFFECTS ═══

const effects: Record<TypoEffect, EffectFn> = {

  // ─── Liquid ────────────────────────────
  liquid(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const wave = Math.sin(i * 0.5 + t * 3) * 10 * (1 - cp) * cfg.intensity
    const stretch = 1 + Math.sin(i * 0.8 + t * 4) * 0.3 * (1 - cp) * cfg.intensity
    return {
      opacity: ease(cp),
      transform: `translateY(${wave}px) scaleY(${0.5 + cp * 0.5 + (stretch - 1) * 0.2}) scaleX(${1 + Math.sin(t * 5 + i) * 0.1 * (1 - cp)})`,
      filter: cp < 0.8 ? `blur(${(1 - cp) * 2}px)` : undefined,
    }
  },

  // ─── Glitch ────────────────────────────
  glitch(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const glitching = cp < 0.7 && Math.random() > 0.6
    const offsetX = glitching ? (Math.random() - 0.5) * 20 * cfg.intensity : 0
    const offsetY = glitching ? (Math.random() - 0.5) * 8 * cfg.intensity : 0
    const skew = glitching ? (Math.random() - 0.5) * 20 : 0
    return {
      opacity: cp > 0.1 ? 1 : 0,
      transform: `translate(${offsetX}px, ${offsetY}px) skewX(${skew}deg)`,
      color: glitching ? (Math.random() > 0.5 ? '#ff0040' : '#00ffcc') : undefined,
      textShadow: glitching ? `${-offsetX}px 0 #ff0040, ${offsetX}px 0 #00ffcc` : undefined,
      letterContent: (glitching && Math.random() > 0.5) ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : undefined,
    }
  },

  // ─── Typewriter ────────────────────────
  typewriter(p, i, total, t, cfg) {
    const typed = Math.floor(p * total * 1.3)
    const visible = i <= typed
    const isCursor = i === Math.min(typed, total - 1)
    // Simulate occasional mistakes: briefly show wrong char
    const mistakePhase = Math.sin(i * 7.3) > 0.7 && p * total > i - 0.5 && p * total < i + 0.3
    return {
      opacity: visible ? 1 : 0,
      transform: 'none',
      letterContent: mistakePhase ? GLITCH_CHARS[Math.floor(Math.abs(Math.sin(i * 13.7)) * 26)] : undefined,
      textShadow: isCursor ? 'none' : undefined,
    }
  },

  // ─── Handwriting ───────────────────────
  handwriting(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger * 2, cfg.duration)
    const wobbleX = Math.sin(i * 3.7 + t * 2) * 1.5 * cfg.intensity
    const wobbleY = Math.cos(i * 2.3 + t * 1.5) * 1 * cfg.intensity
    const tilt = Math.sin(i * 1.7) * 3 * cfg.intensity
    const scaleP = cp < 0.3 ? cp / 0.3 : 1
    return {
      opacity: cp > 0 ? Math.min(1, cp * 2) : 0,
      transform: `translate(${wobbleX}px, ${wobbleY}px) rotate(${tilt * (1 - cp * 0.5)}deg) scale(${0.8 + scaleP * 0.2})`,
    }
  },

  // ─── Gravity ───────────────────────────
  gravity(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const fallDistance = -300 * cfg.intensity
    const bounceP = easeElastic(cp)
    const y = fallDistance * (1 - bounceP)
    const rotation = (1 - cp) * (i % 2 ? 1 : -1) * 180 * cfg.intensity
    return {
      opacity: cp > 0.05 ? 1 : 0,
      transform: `translateY(${y}px) rotate(${rotation}deg)`,
    }
  },

  // ─── Magnetic ──────────────────────────
  magnetic(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const rect = cfg.charRects[i]
    if (!rect) return { opacity: ease(cp), transform: 'none' }
    const charCX = rect.left + rect.width / 2
    const charCY = rect.top + rect.height / 2
    const dx = charCX - cfg.mouseX
    const dy = charCY - cfg.mouseY
    const dist = Math.sqrt(dx * dx + dy * dy) + 1
    const force = Math.min(30, 3000 / dist) * cfg.intensity * cp
    const pushX = (dx / dist) * force
    const pushY = (dy / dist) * force
    return {
      opacity: ease(cp),
      transform: `translate(${pushX}px, ${pushY}px)`,
    }
  },

  // ─── Wave ──────────────────────────────
  wave(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const waveY = Math.sin(i * 0.4 + t * 4) * 15 * cfg.intensity
    const waveR = Math.sin(i * 0.3 + t * 3) * 5 * cfg.intensity
    return {
      opacity: ease(Math.min(1, cp * 1.5)),
      transform: `translateY(${waveY * cp}px) rotate(${waveR * cp}deg)`,
    }
  },

  // ─── Scramble ──────────────────────────
  scramble(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const resolved = cp > 0.7
    return {
      opacity: cp > 0.05 ? 1 : 0,
      transform: resolved ? 'none' : `translateY(${(Math.random() - 0.5) * 4}px)`,
      letterContent: resolved ? undefined : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)],
    }
  },

  // ─── Fade ──────────────────────────────
  fade(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    return {
      opacity: ease(cp),
      transform: `translateY(${(1 - ease(cp)) * 20 * cfg.intensity}px)`,
    }
  },

  // ─── Bounce ────────────────────────────
  bounce(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const y = -100 * (1 - easeElastic(cp)) * cfg.intensity
    return {
      opacity: cp > 0.05 ? 1 : 0,
      transform: `translateY(${y}px)`,
    }
  },

  // ─── Split ─────────────────────────────
  split(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const angle = (i / total) * Math.PI * 2 + i * 0.5
    const distance = 200 * (1 - ease(cp)) * cfg.intensity
    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance
    return {
      opacity: ease(cp),
      transform: `translate(${x}px, ${y}px) rotate(${(1 - cp) * 360}deg)`,
    }
  },

  // ─── Blur ──────────────────────────────
  blur(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const blurAmt = (1 - ease(cp)) * 12 * cfg.intensity
    return {
      opacity: 0.3 + cp * 0.7,
      transform: `scale(${0.9 + cp * 0.1})`,
      filter: `blur(${blurAmt}px)`,
    }
  },

  // ─── Rotate ────────────────────────────
  rotate(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const rot = (1 - easeBack(cp)) * (i % 2 ? 90 : -90) * cfg.intensity
    return {
      opacity: ease(cp),
      transform: `rotate(${rot}deg) scale(${0.5 + cp * 0.5})`,
    }
  },

  // ─── Scale ─────────────────────────────
  scale(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const s = easeElastic(cp)
    return {
      opacity: cp > 0.05 ? 1 : 0,
      transform: `scale(${s})`,
    }
  },

  // ─── Slide ─────────────────────────────
  slide(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const x = (1 - ease(cp)) * 60 * cfg.intensity * (i % 2 ? 1 : -1)
    return {
      opacity: ease(cp),
      transform: `translateX(${x}px)`,
    }
  },

  // ─── Rainbow ───────────────────────────
  rainbow(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const hue = ((i / total) * 360 + t * 100) % 360
    return {
      opacity: ease(cp),
      transform: `translateY(${(1 - ease(cp)) * 15}px)`,
      color: `hsl(${hue}, 80%, 65%)`,
    }
  },

  // ─── Neon ──────────────────────────────
  neon(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const flicker = cp > 0.3 ? (Math.sin(t * 20 + i * 5) > 0.3 ? 1 : 0.3) : 0
    const glow = cp > 0.5 ? `0 0 ${5 + Math.sin(t * 8 + i) * 3}px currentColor, 0 0 ${15 + Math.sin(t * 6 + i * 2) * 5}px currentColor` : 'none'
    return {
      opacity: cp * flicker,
      transform: 'none',
      textShadow: glow,
    }
  },

  // ─── Matrix ────────────────────────────
  matrix(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger * 2, cfg.duration)
    const resolved = cp > 0.8
    const rain = !resolved && cp > 0
    return {
      opacity: cp > 0.05 ? 1 : 0,
      transform: rain ? `translateY(${(1 - cp) * -30}px)` : 'none',
      color: resolved ? undefined : '#00ff41',
      letterContent: rain ? MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)] : undefined,
      textShadow: rain ? '0 0 8px #00ff41' : undefined,
    }
  },

  // ─── Shatter ───────────────────────────
  shatter(p, i, total, t, cfg) {
    // Appears whole, then shatters outward
    const shatterStart = 0.3
    if (p < shatterStart) return { opacity: 1, transform: 'none' }
    const sp = (p - shatterStart) / (1 - shatterStart)
    const angle = (i * 2.7 + i * i * 0.3) % (Math.PI * 2)
    const dist = sp * 300 * cfg.intensity * (0.5 + Math.abs(Math.sin(i * 1.7)) * 0.5)
    const x = Math.cos(angle) * dist
    const y = Math.sin(angle) * dist + sp * sp * 200 // gravity
    const rot = sp * (i % 2 ? 1 : -1) * 360
    return {
      opacity: Math.max(0, 1 - sp * 1.5),
      transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${1 - sp * 0.5})`,
    }
  },

  // ─── Elastic ───────────────────────────
  elastic(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const elastic = easeElastic(cp)
    const overshoot = cp < 0.5 ? 0 : Math.sin(cp * Math.PI * 4) * 5 * (1 - cp) * cfg.intensity
    return {
      opacity: cp > 0.05 ? 1 : 0,
      transform: `translateY(${-30 * (1 - elastic) + overshoot}px) scaleX(${0.8 + elastic * 0.2 + Math.sin(cp * 6) * 0.05})`,
    }
  },

  // ─── Breath ────────────────────────────
  breath(p, i, total, t, cfg) {
    // Continuous breathing — ignores p, uses time
    const phase = Math.sin(t * 2 + i * 0.3) * 0.5 + 0.5
    const s = 1 + phase * 0.08 * cfg.intensity
    const y = Math.sin(t * 2 + i * 0.3) * 3 * cfg.intensity
    return {
      opacity: 0.7 + phase * 0.3,
      transform: `scale(${s}) translateY(${y}px)`,
    }
  },

  // ─── Flicker ───────────────────────────
  flicker(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const noise = Math.sin(t * 30 + i * 17.3) * Math.cos(t * 23 + i * 11.7)
    const flicker = noise > 0 ? 1 : 0.1
    return {
      opacity: cp * (cp > 0.8 ? 1 : flicker),
      transform: `translateY(${(1 - cp) * 10}px)`,
    }
  },

  // ─── Drip ──────────────────────────────
  drip(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const dripAmount = cp > 0.5 ? (cp - 0.5) * 2 : 0
    const stretch = 1 + dripAmount * 0.4 * cfg.intensity * Math.abs(Math.sin(i * 2.3))
    const dripY = dripAmount * 20 * cfg.intensity * Math.abs(Math.sin(i * 3.1))
    return {
      opacity: ease(cp),
      transform: `translateY(${(1 - cp) * -30 + dripY}px) scaleY(${stretch})`,
    }
  },

  // ─── Magnet ────────────────────────────
  magnet(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger * 0.5, cfg.duration)
    // Start scattered, snap together
    const scatter = (1 - easeBack(Math.min(1, cp * 1.2)))
    const seedX = Math.sin(i * 7.3 + 1) * 300 * cfg.intensity
    const seedY = Math.cos(i * 4.1 + 2) * 200 * cfg.intensity
    const rot = Math.sin(i * 5.7) * 180 * scatter
    return {
      opacity: 0.3 + cp * 0.7,
      transform: `translate(${seedX * scatter}px, ${seedY * scatter}px) rotate(${rot}deg)`,
    }
  },

  // ─── Phantom ───────────────────────────
  phantom(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const ghostOffset = Math.sin(t * 3 + i * 0.5) * 5 * cfg.intensity
    const ghostOpacity = 0.15 + Math.sin(t * 2 + i) * 0.1
    return {
      opacity: ease(cp),
      transform: `translateX(${ghostOffset * (1 - cp * 0.5)}px)`,
      textShadow: cp > 0.3 ? `${ghostOffset}px ${ghostOffset * 0.5}px 4px rgba(255,255,255,${ghostOpacity})` : 'none',
    }
  },

  // ═══════════════════════════════════════
  // 50 NEW EFFECTS
  // ═══════════════════════════════════════

  spiral(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const angle = (1 - ease(cp)) * Math.PI * 4 + i * 0.3
    const radius = (1 - ease(cp)) * 200 * cfg.intensity
    return { opacity: ease(cp), transform: `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px) rotate(${(1 - cp) * 720}deg)` }
  },

  cascade(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger * 1.5, cfg.duration)
    const x = (1 - ease(cp)) * -80 * cfg.intensity
    const y = (1 - ease(cp)) * -60 * cfg.intensity
    return { opacity: ease(cp), transform: `translate(${x}px, ${y}px)` }
  },

  rubberband(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const stretch = cp < 0.4 ? 1 + (cp / 0.4) * 1.5 * cfg.intensity : 1 + (1 - (cp - 0.4) / 0.6) * 0.3
    return { opacity: cp > 0.05 ? 1 : 0, transform: `scaleX(${stretch}) scaleY(${2 - stretch})` }
  },

  swing(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const angle = Math.sin(cp * Math.PI * 3) * 40 * (1 - cp) * cfg.intensity
    return { opacity: ease(cp), transform: `rotate(${angle}deg) translateY(${(1 - cp) * -20}px)` }
  },

  unfold(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const rotX = (1 - ease(cp)) * 90 * cfg.intensity
    return { opacity: ease(cp), transform: `perspective(400px) rotateX(${rotX}deg) translateY(${(1 - cp) * -15}px)` }
  },

  pixelate(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const jitter = cp < 0.6 ? (Math.random() - 0.5) * 6 : 0
    return { opacity: cp > 0.1 ? 1 : 0, transform: `translate(${jitter}px, ${jitter}px) scale(${0.5 + cp * 0.5})`, filter: cp < 0.5 ? `blur(${(1 - cp * 2) * 4}px)` : undefined, letterContent: cp < 0.4 ? '█' : undefined }
  },

  spring(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const springY = Math.sin(cp * Math.PI * 5) * 20 * (1 - cp) * cfg.intensity
    return { opacity: ease(cp), transform: `translateY(${springY + (1 - cp) * -40}px)` }
  },

  tornado(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger * 0.5, cfg.duration)
    const angle = (1 - cp) * Math.PI * 6
    const radius = (1 - ease(cp)) * 150 * cfg.intensity
    const y = (1 - cp) * -200
    return { opacity: ease(cp), transform: `translate(${Math.cos(angle + i) * radius}px, ${y + Math.sin(angle) * 20}px) rotate(${(1 - cp) * 540}deg)` }
  },

  domino(p, i, total, t, cfg) {
    const delay = i * 0.08
    const cp = clamp((p - delay) / (1 - delay + 0.001), 0, 1)
    const tilt = cp < 0.5 ? (1 - cp * 2) * 90 * cfg.intensity : Math.sin((cp - 0.5) * Math.PI * 4) * 10 * (1 - cp)
    return { opacity: cp > 0.02 ? 1 : 0, transform: `rotate(${tilt}deg)` }
  },

  inflate(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const inflate = easeElastic(cp)
    const wobble = Math.sin(cp * Math.PI * 3) * 0.1 * (1 - cp)
    return { opacity: cp > 0.05 ? 1 : 0, transform: `scale(${inflate + wobble}) translateY(${(1 - cp) * 20}px)` }
  },

  'x-ray'(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const outline = cp < 0.6
    return { opacity: ease(cp), transform: `scale(${0.95 + cp * 0.05})`, color: outline ? 'transparent' : undefined, textShadow: outline ? `0 0 1px currentColor` : 'none' }
  },

  ticker(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger * 0.8, cfg.duration)
    const x = (1 - ease(cp)) * 100 * cfg.intensity
    return { opacity: ease(cp), transform: `translateX(${x}px)` }
  },

  pop(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const s = cp < 0.5 ? easeBack(cp * 2) * 1.3 : 1 + (1 - (cp - 0.5) * 2) * 0.3
    return { opacity: cp > 0.05 ? 1 : 0, transform: `scale(${Math.max(0, s)})` }
  },

  earthquake(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const shake = (1 - cp) * cfg.intensity
    const x = (Math.sin(t * 40 + i * 7) * 8 + Math.cos(t * 33 + i * 11) * 4) * shake
    const y = (Math.cos(t * 37 + i * 5) * 5) * shake
    return { opacity: ease(Math.min(1, cp * 1.5)), transform: `translate(${x}px, ${y}px)` }
  },

  dissolve(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const noiseVal = Math.sin(i * 13.7 + t * 5) * 0.5 + 0.5
    const visible = cp > noiseVal * 0.7
    return { opacity: visible ? ease(cp) : 0, transform: visible ? 'none' : `scale(0.5) translateY(${(Math.random() - 0.5) * 10}px)` }
  },

  origami(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const foldAngle = (1 - ease(cp)) * 180 * cfg.intensity * (i % 2 ? 1 : -1)
    return { opacity: ease(cp), transform: `perspective(300px) rotateY(${foldAngle}deg) scale(${0.8 + cp * 0.2})` }
  },

  spotlight(p, i, total, t, cfg) {
    const center = p * (total + 4) - 2
    const dist = Math.abs(i - center)
    const lit = Math.max(0, 1 - dist / 3)
    return { opacity: lit, transform: `scale(${0.9 + lit * 0.1})` }
  },

  morse(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger * 2, cfg.duration)
    const beat = Math.floor(cp * 6)
    const on = beat % 2 === 0 || cp > 0.8
    return { opacity: on ? (cp > 0.8 ? 1 : 0.7) : 0, transform: 'none' }
  },

  rippletext(p, i, total, t, cfg) {
    const center = Math.floor(total / 2)
    const dist = Math.abs(i - center)
    const delay = dist * 0.04
    const cp = clamp((p - delay) / (1 - delay + 0.001), 0, 1)
    const y = (1 - easeElastic(cp)) * 30 * cfg.intensity
    return { opacity: ease(cp), transform: `translateY(${y}px) scale(${0.8 + easeElastic(cp) * 0.2})` }
  },

  conveyor(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const rotZ = (1 - ease(cp)) * -90
    const x = (1 - ease(cp)) * 40
    return { opacity: ease(cp), transform: `translateX(${x}px) rotate(${rotZ}deg)` }
  },

  pendulum(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const swing = Math.sin(cp * Math.PI * 4) * 25 * (1 - cp) * cfg.intensity
    return { opacity: ease(cp), transform: `rotate(${swing}deg)` }
  },

  static(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const noise = cp < 0.7
    const ox = noise ? (Math.random() - 0.5) * 3 : 0
    const oy = noise ? (Math.random() - 0.5) * 3 : 0
    return { opacity: noise ? (Math.random() > 0.3 ? 0.6 : 0.1) : ease(cp), transform: `translate(${ox}px,${oy}px)`, letterContent: noise && Math.random() > 0.6 ? String.fromCharCode(0x2588 + Math.floor(Math.random() * 4)) : undefined }
  },

  emerge(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const y = (1 - ease(cp)) * 40 * cfg.intensity
    const clip = ease(cp)
    return { opacity: clip, transform: `translateY(${y}px) scale(${0.9 + cp * 0.1})` }
  },

  float(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const floatY = Math.sin(t * 1.5 + i * 0.4) * 8 * cfg.intensity * cp
    const floatX = Math.cos(t * 1.2 + i * 0.6) * 3 * cfg.intensity * cp
    return { opacity: ease(cp), transform: `translate(${floatX}px, ${(1 - cp) * 30 + floatY}px)` }
  },

  vhs(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const tracking = cp < 0.6
    const offsetX = tracking ? Math.sin(t * 30 + i) * 10 * cfg.intensity : 0
    const skew = tracking ? Math.sin(t * 20) * 5 : 0
    return { opacity: tracking ? 0.5 + Math.random() * 0.3 : ease(cp), transform: `translateX(${offsetX}px) skewX(${skew}deg)`, color: tracking && Math.random() > 0.8 ? '#ff0060' : undefined }
  },

  stamp(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger * 0.5, cfg.duration)
    const s = cp < 0.3 ? 3 * (1 - cp / 0.3) + 1 : 1 + Math.sin((cp - 0.3) * Math.PI * 3) * 0.05 * (1 - cp)
    return { opacity: cp > 0.05 ? Math.min(1, cp * 3) : 0, transform: `scale(${s})` }
  },

  orbit(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const angle = (1 - ease(cp)) * Math.PI * 2 + i * 0.5
    const radius = (1 - ease(cp)) * 100 * cfg.intensity
    return { opacity: ease(cp), transform: `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius * 0.5}px)` }
  },

  rewind(p, i, total, t, cfg) {
    // Shows text, then reverses
    const half = p < 0.4
    const cp = half ? p / 0.4 : 1 - (p - 0.4) / 0.6
    const ci = charProgress(cp, i, total, cfg.stagger, cfg.duration)
    return { opacity: ease(ci), transform: `translateX(${(1 - ease(ci)) * (half ? -30 : 30)}px)` }
  },

  thermal(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const shimmer = Math.sin(t * 8 + i * 3) * 3 * (1 - cp * 0.5) * cfg.intensity
    const shimmerY = Math.cos(t * 6 + i * 5) * 2 * (1 - cp * 0.5)
    return { opacity: ease(cp), transform: `translate(${shimmer}px, ${shimmerY}px) scaleY(${1 + Math.sin(t * 10 + i) * 0.03})` }
  },

  pulse(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const beat = 1 + Math.sin(t * 6 + i * 0.3) * 0.1 * cfg.intensity * cp
    return { opacity: ease(cp), transform: `scale(${beat})` }
  },

  slash(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const diagX = (1 - ease(cp)) * 50 * cfg.intensity
    const diagY = (1 - ease(cp)) * -50 * cfg.intensity
    return { opacity: ease(cp), transform: `translate(${diagX}px, ${diagY}px)` }
  },

  cipher(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger * 1.5, cfg.duration)
    const cipherStage = Math.floor(cp * 5)
    const nums = '0123456789'
    let content: string | undefined
    if (cp < 0.8) content = nums[Math.floor(Math.abs(Math.sin(t * 10 + i * 7)) * 10)]
    return { opacity: cp > 0.03 ? 1 : 0, transform: `translateY(${(1 - cp) * 8}px)`, letterContent: content }
  },

  levitate(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const bob = Math.sin(t * 2 + i * 0.5) * 5 * cfg.intensity * cp
    const y = (1 - ease(cp)) * 40 + bob
    return { opacity: ease(cp), transform: `translateY(${-y}px)` }
  },

  whip(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger * 0.6, cfg.duration)
    const x = cp < 0.5 ? (1 - cp * 2) * -200 * cfg.intensity : Math.sin((cp - 0.5) * Math.PI * 4) * 8 * (1 - cp)
    return { opacity: cp > 0.05 ? 1 : 0, transform: `translateX(${x}px)` }
  },

  cascade3d(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const rotX = (1 - ease(cp)) * 60 * cfg.intensity
    const z = (1 - ease(cp)) * -100
    return { opacity: ease(cp), transform: `perspective(500px) rotateX(${rotX}deg) translateZ(${z}px)` }
  },

  melt(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    if (p < 0.3) return { opacity: 1, transform: 'none' }
    const mp = (p - 0.3) / 0.7
    const dripY = mp * 60 * cfg.intensity * (0.5 + Math.abs(Math.sin(i * 2.7)) * 0.5)
    const stretch = 1 + mp * 0.6
    return { opacity: Math.max(0, 1 - mp * 1.2), transform: `translateY(${dripY}px) scaleY(${stretch}) scaleX(${1 - mp * 0.3})` }
  },

  assemble(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger * 0.4, cfg.duration)
    const pieces = 3
    const piece = i % pieces
    const fromX = (piece === 0 ? -1 : piece === 1 ? 0 : 1) * 150 * (1 - ease(cp)) * cfg.intensity
    const fromY = (piece === 1 ? -1 : 1) * 100 * (1 - ease(cp)) * cfg.intensity
    const rot = (1 - cp) * (piece - 1) * 90
    return { opacity: ease(cp), transform: `translate(${fromX}px, ${fromY}px) rotate(${rot}deg)` }
  },

  vertigo(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const spin = (1 - ease(cp)) * 360 * 2 * cfg.intensity
    const s = 0.1 + ease(cp) * 0.9
    return { opacity: ease(cp), transform: `rotate(${spin}deg) scale(${s})` }
  },

  radar(p, i, total, t, cfg) {
    const sweep = p * total * 1.5
    const dist = Math.abs(i - sweep)
    const lit = Math.max(0, 1 - dist / 2)
    const settled = i < sweep - 2
    return { opacity: settled ? 1 : lit, transform: settled ? 'none' : `scale(${0.8 + lit * 0.2})`, color: lit > 0.5 && !settled ? '#4ade80' : undefined }
  },

  firework(p, i, total, t, cfg) {
    if (p < 0.2) return { opacity: 0, transform: 'none' }
    if (p < 0.5) {
      const ep = (p - 0.2) / 0.3
      const angle = (i / total) * Math.PI * 2
      const dist = easeElastic(ep) * 200 * cfg.intensity
      return { opacity: 1, transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)` }
    }
    const rp = (p - 0.5) / 0.5
    const angle = (i / total) * Math.PI * 2
    const dist = (1 - ease(rp)) * 200 * cfg.intensity
    return { opacity: 1, transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)` }
  },

  telegraph(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger * 3, cfg.duration)
    const ticking = cp > 0 && cp < 0.8
    return { opacity: cp > 0.1 ? 1 : 0, transform: ticking ? `translateY(${Math.sin(t * 20) * 2}px)` : 'none', letterContent: ticking && cp < 0.5 ? '·' : undefined }
  },

  unfurl(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const rotY = (1 - ease(cp)) * -90 * cfg.intensity
    const x = (1 - ease(cp)) * -20
    return { opacity: ease(cp), transform: `perspective(400px) rotateY(${rotY}deg) translateX(${x}px)` }
  },

  sway(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const swayAngle = Math.sin(t * 1.5 + i * 0.4) * 8 * cfg.intensity * cp
    const swayX = Math.sin(t * 1.2 + i * 0.3) * 4 * cfg.intensity * cp
    return { opacity: ease(cp), transform: `rotate(${swayAngle}deg) translateX(${swayX}px) translateY(${(1 - cp) * 20}px)` }
  },

  jitter(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const jit = (1 - cp) * cfg.intensity
    const x = Math.sin(t * 50 + i * 13) * 4 * jit
    const y = Math.cos(t * 47 + i * 9) * 3 * jit
    const r = Math.sin(t * 53 + i * 17) * 5 * jit
    return { opacity: ease(Math.min(1, cp * 1.3)), transform: `translate(${x}px,${y}px) rotate(${r}deg)` }
  },

  crash(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger * 0.3, cfg.duration)
    const y = cp < 0.4 ? (1 - cp / 0.4) * -400 * cfg.intensity : Math.sin((cp - 0.4) * Math.PI * 6) * 5 * (1 - cp)
    const squash = cp > 0.35 && cp < 0.5 ? 0.7 : 1
    return { opacity: cp > 0.02 ? 1 : 0, transform: `translateY(${y}px) scaleY(${squash}) scaleX(${2 - squash})` }
  },

  warp(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const warpX = (1 - ease(cp)) * Math.sin(i * 1.5) * 40 * cfg.intensity
    const scaleX = 0.2 + ease(cp) * 0.8 + Math.sin(cp * Math.PI) * 0.3
    return { opacity: ease(cp), transform: `translateX(${warpX}px) scaleX(${scaleX})` }
  },

  scatter(p, i, total, t, cfg) {
    // Start normal, scatter, then reassemble
    if (p < 0.2) return { opacity: 1, transform: 'none' }
    if (p < 0.6) {
      const sp = (p - 0.2) / 0.4
      const x = Math.sin(i * 5.3) * 200 * ease(sp) * cfg.intensity
      const y = Math.cos(i * 3.7) * 150 * ease(sp) * cfg.intensity
      return { opacity: 1, transform: `translate(${x}px, ${y}px) rotate(${sp * 180 * (i % 2 ? 1 : -1)}deg)` }
    }
    const rp = (p - 0.6) / 0.4
    const x = Math.sin(i * 5.3) * 200 * (1 - ease(rp)) * cfg.intensity
    const y = Math.cos(i * 3.7) * 150 * (1 - ease(rp)) * cfg.intensity
    return { opacity: 1, transform: `translate(${x}px, ${y}px) rotate(${(1 - rp) * 180 * (i % 2 ? 1 : -1)}deg)` }
  },

  tilt(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const tiltX = (1 - ease(cp)) * 45 * cfg.intensity
    const tiltY = (1 - ease(cp)) * (i % 2 ? 20 : -20) * cfg.intensity
    return { opacity: ease(cp), transform: `perspective(400px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)` }
  },

  glow(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const glowSize = ease(cp) * 12 * cfg.intensity
    return { opacity: ease(cp), transform: `scale(${0.95 + cp * 0.05})`, textShadow: `0 0 ${glowSize}px currentColor, 0 0 ${glowSize * 2}px currentColor` }
  },

  countdown(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger * 0.5, cfg.duration)
    const countPhase = Math.floor((1 - cp) * 4) // 3, 2, 1, 0
    const countChars = ['', '1', '2', '3']
    const counting = cp < 0.7
    return { opacity: cp > 0.05 ? 1 : 0, transform: counting ? `scale(${1.2 - cp * 0.3})` : `scale(${easeElastic(Math.min(1, (cp - 0.7) / 0.3))})`, letterContent: counting && countPhase > 0 ? countChars[countPhase] : undefined }
  },

  ricochet(p, i, total, t, cfg) {
    const cp = charProgress(p, i, total, cfg.stagger, cfg.duration)
    const bounces = 3
    const bp = cp * bounces
    const currentBounce = Math.floor(bp)
    const bounceP = bp - currentBounce
    const wallX = currentBounce % 2 === 0 ? -1 : 1
    const dampening = Math.pow(0.6, currentBounce)
    const x = (1 - cp) * wallX * 150 * dampening * cfg.intensity * Math.cos(bounceP * Math.PI)
    const y = (1 - cp) * -100 * dampening * Math.abs(Math.sin(bounceP * Math.PI))
    return { opacity: cp > 0.02 ? 1 : 0, transform: `translate(${x}px, ${y}px)` }
  },
}

export function getEffect(name: TypoEffect): EffectFn {
  return effects[name] || effects.fade
}

export function getAllEffectNames(): TypoEffect[] {
  return Object.keys(effects) as TypoEffect[]
}

export { type EffectFn, type EffectCtx }
