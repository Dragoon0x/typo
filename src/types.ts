// ═══════════════════════════════════════════
// TYPO — Types
// ═══════════════════════════════════════════

export type TypoEffect =
  | 'liquid'        // Characters morph and flow like water
  | 'glitch'        // Random offset, color split, flicker
  | 'typewriter'    // Types out with realistic timing and mistakes
  | 'handwriting'   // Simulated pen strokes, slight wobble
  | 'gravity'       // Characters fall from above and bounce
  | 'magnetic'      // Characters repel from cursor
  | 'wave'          // Sine wave propagation through text
  | 'scramble'      // Random characters resolve to real text
  | 'fade'          // Staggered fade-in per character
  | 'bounce'        // Each character bounces with spring physics
  | 'split'         // Characters fly in from random directions
  | 'blur'          // Focus sweep from blurry to sharp
  | 'rotate'        // Characters rotate into place
  | 'scale'         // Characters scale up from zero
  | 'slide'         // Characters slide in from a direction
  | 'rainbow'       // Cycling hue per character
  | 'neon'          // Neon glow flicker effect
  | 'matrix'        // Green rain resolving to text
  | 'shatter'       // Text appears whole then shatters
  | 'elastic'       // Elastic spring overshoot on each char
  | 'breath'        // Continuous gentle scale breathing
  | 'flicker'       // Random opacity flicker like old film
  | 'drip'          // Characters drip downward like paint
  | 'magnet'        // Characters snap together from scattered
  | 'phantom'       // Ghost trails following each character
  // ─── 50 NEW EFFECTS ───
  | 'spiral'        // Characters spiral inward from orbit
  | 'cascade'       // Waterfall cascade from top-left
  | 'rubberband'    // Stretch then snap back
  | 'swing'         // Pendulum swing from top
  | 'unfold'        // Characters unfold like paper
  | 'pixelate'      // Pixelated blocks resolve to text
  | 'spring'        // Springy vertical oscillation
  | 'tornado'       // Spinning vortex assembly
  | 'domino'        // Each char tips the next
  | 'inflate'       // Characters inflate like balloons
  | 'x-ray'         // Skeleton/outline to solid
  | 'ticker'        // Stock ticker horizontal scroll-in
  | 'pop'           // Pop in with overshoot scale
  | 'earthquake'    // Random shaking tremor
  | 'dissolve'      // Particle dissolve/materialize
  | 'origami'       // Folding paper effect
  | 'spotlight'     // Darkness with spotlight sweep
  | 'morse'         // Blinks in morse-code rhythm
  | 'rippletext'    // Ripple expanding from center char
  | 'conveyor'      // Conveyor belt roll-in
  | 'pendulum'      // Swinging pendulum per char
  | 'static'        // TV static noise overlay
  | 'emerge'        // Rising from a surface
  | 'float'         // Gentle floating like in water
  | 'vhs'           // VHS tracking distortion
  | 'stamp'         // Stamped down with impact
  | 'orbit'         // Circular orbit then settle
  | 'rewind'        // Appears then rewinds backward
  | 'thermal'       // Heat shimmer distortion
  | 'pulse'         // Pulsing scale beat
  | 'slash'         // Diagonal slash reveal
  | 'cipher'        // Number cipher countdown to letter
  | 'levitate'      // Float up with subtle bob
  | 'whip'          // Whip crack snap into place
  | 'cascade3d'     // 3D perspective cascade
  | 'melt'          // Characters melt downward
  | 'assemble'      // Pieces assemble from fragments
  | 'vertigo'       // Dizzy spinning zoom
  | 'radar'         // Radar sweep reveals chars
  | 'firework'      // Burst outward then reform
  | 'telegraph'     // Dot-dash telegraph arrival
  | 'unfurl'        // Flag unfurl left to right
  | 'sway'          // Gentle tree sway motion
  | 'jitter'        // Nervous jitter vibration
  | 'crash'         // Slam down from above, crack
  | 'warp'          // Space warp stretch
  | 'scatter'       // Scatter then reconvene
  | 'tilt'          // 3D tilt into view
  | 'glow'          // Growing inner glow
  | 'countdown'     // 3-2-1 countdown then appear
  | 'ricochet'      // Bounce off walls into place

export type TypoTrigger = 'mount' | 'hover' | 'click' | 'scroll' | 'manual'

export interface TypoConfig {
  /** Text to animate */
  text: string
  /** Effect type. Default: 'fade' */
  effect?: TypoEffect
  /** Animation duration in ms. Default: 1000 */
  duration?: number
  /** Stagger delay between characters in ms. Default: 30 */
  stagger?: number
  /** When to trigger. Default: 'mount' */
  trigger?: TypoTrigger
  /** Loop the animation. Default: false */
  loop?: boolean
  /** Loop delay in ms. Default: 2000 */
  loopDelay?: number
  /** CSS color. Default: 'inherit' */
  color?: string
  /** Font size in px. Default: inherit */
  fontSize?: number
  /** Font family. Default: inherit */
  fontFamily?: string
  /** Font weight. Default: inherit */
  fontWeight?: number | string
  /** Cursor-reactive (for magnetic, etc). Default: true */
  interactive?: boolean
  /** Animation easing. Default: 'ease-out' */
  easing?: string
  /** Custom CSS class */
  className?: string
  /** Inline styles */
  style?: Record<string, any>
  /** Callback when animation completes */
  onComplete?: () => void
  /** Speed multiplier. Default: 1 */
  speed?: number
  /** Intensity of the effect 0-1. Default: 1 */
  intensity?: number
}

export interface TypoProps extends TypoConfig {
  /** HTML tag to render. Default: 'span' */
  as?: keyof HTMLElementTagNameMap
}

export interface CharState {
  char: string
  index: number
  x: number
  y: number
  opacity: number
  scale: number
  rotation: number
  blur: number
  offsetX: number
  offsetY: number
  color: string
  progress: number
  velocity: number
  extra: Record<string, number>
}

export const ALL_EFFECTS: TypoEffect[] = [
  'liquid', 'glitch', 'typewriter', 'handwriting', 'gravity', 'magnetic',
  'wave', 'scramble', 'fade', 'bounce', 'split', 'blur', 'rotate', 'scale',
  'slide', 'rainbow', 'neon', 'matrix', 'shatter', 'elastic', 'breath',
  'flicker', 'drip', 'magnet', 'phantom',
  'spiral', 'cascade', 'rubberband', 'swing', 'unfold', 'pixelate', 'spring',
  'tornado', 'domino', 'inflate', 'x-ray', 'ticker', 'pop', 'earthquake',
  'dissolve', 'origami', 'spotlight', 'morse', 'rippletext', 'conveyor',
  'pendulum', 'static', 'emerge', 'float', 'vhs', 'stamp', 'orbit', 'rewind',
  'thermal', 'pulse', 'slash', 'cipher', 'levitate', 'whip', 'cascade3d',
  'melt', 'assemble', 'vertigo', 'radar', 'firework', 'telegraph', 'unfurl',
  'sway', 'jitter', 'crash', 'warp', 'scatter', 'tilt', 'glow', 'countdown',
  'ricochet',
]
