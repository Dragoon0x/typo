# usetypoui

76 kinetic text effects. One React component. Cursor-reactive. Loop-ready. Zero dependencies.

```
npm install usetypoui
```

## Quick Start

```jsx
import { Typo } from 'usetypoui'

<Typo text="hello world" effect="liquid" />
<Typo text="BREAKING" effect="glitch" loop />
<Typo text="Once upon a time..." effect="typewriter" duration={3000} />
<Typo text="Move your cursor" effect="magnetic" />
```

## 76 Effects

**Physics & Motion**
liquid, gravity, bounce, elastic, spring, pendulum, ricochet, rubberband, earthquake, crash, whip

**Glitch & Digital**
glitch, matrix, vhs, static, pixelate, cipher, morse, ticker, telegraph, countdown

**Entrance & Reveal**
typewriter, handwriting, fade, split, slide, emerge, unfold, unfurl, assemble, pop, domino, cascade, stamp

**Transform**
wave, rotate, scale, blur, shatter, melt, spiral, tornado, warp, tilt, vertigo, inflate, origami

**Cursor-Reactive**
magnetic, magnet, spotlight, orbit, radar

**Atmosphere**
neon, rainbow, glow, flicker, breath, phantom, drip, float, levitate, thermal, pulse, rippletext

**Cinematic**
scramble, x-ray, dissolve, firework, conveyor, rewind, scatter, sway, jitter, slash, cascade3d

## Props

| Prop | Default | Description |
|------|---------|------------|
| `text` | required | Text to animate |
| `effect` | `'fade'` | Effect name (see list above) |
| `duration` | `1000` | Animation duration in ms |
| `stagger` | `30` | Delay between characters in ms |
| `trigger` | `'mount'` | When to start: mount, hover, click, scroll, manual |
| `loop` | `false` | Loop the animation |
| `loopDelay` | `2000` | Delay between loops in ms |
| `color` | inherit | Text color |
| `fontSize` | inherit | Font size in px |
| `fontFamily` | inherit | Font family |
| `fontWeight` | inherit | Font weight |
| `interactive` | `true` | Cursor-reactive effects respond to mouse |
| `speed` | `1` | Speed multiplier |
| `intensity` | `1` | Effect intensity 0-1 |
| `as` | `'span'` | HTML tag to render |
| `onComplete` | - | Callback when animation finishes |

## Vanilla JS

```js
import { animateText } from 'usetypoui'

const el = document.querySelector('.title')
const stop = animateText(el, 'Hello World', 'gravity', { duration: 1500 })

// Later
stop()
```

## Effect Combos

```jsx
// Hero heading with loop
<Typo text="Ship faster." effect="liquid" fontSize={72} loop loopDelay={3000} />

// Subtitle with stagger
<Typo text="Build what matters." effect="fade" stagger={50} duration={1500} />

// Interactive element
<Typo text="Hover me" effect="magnetic" trigger="hover" />

// Matrix rain
<Typo text="SYSTEM ONLINE" effect="matrix" color="#00ff41" loop />

// Neon sign
<Typo text="OPEN" effect="neon" color="#ff006a" loop />
```

## All 76 Effects

liquid, glitch, typewriter, handwriting, gravity, magnetic, wave, scramble, fade, bounce, split, blur, rotate, scale, slide, rainbow, neon, matrix, shatter, elastic, breath, flicker, drip, magnet, phantom, spiral, cascade, rubberband, swing, unfold, pixelate, spring, tornado, domino, inflate, x-ray, ticker, pop, earthquake, dissolve, origami, spotlight, morse, rippletext, conveyor, pendulum, static, emerge, float, vhs, stamp, orbit, rewind, thermal, pulse, slash, cipher, levitate, whip, cascade3d, melt, assemble, vertigo, radar, firework, telegraph, unfurl, sway, jitter, crash, warp, scatter, tilt, glow, countdown, ricochet.

## Disclaimer

Experimental, open-source software. Provided as-is. No warranties. DYOR.

## License

MIT — [0xDragoon](https://github.com/dragoon0x)
