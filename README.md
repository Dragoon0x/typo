# TYPO

Kinetic typography engine. One component, 25 text effects.

```
npm install typoui
```

Give it a string and an effect. It animates text with physics: liquid morph, glitch, typewriter with mistakes, handwriting simulation, gravity drop, magnetic repulsion from cursor, and 19 more.

## Quick Start

```jsx
import { Typo } from 'typoui'

<Typo text="hello world" effect="liquid" />
<Typo text="BREAKING" effect="glitch" loop />
<Typo text="Once upon a time..." effect="typewriter" duration={3000} />
<Typo text="Move your cursor" effect="magnetic" />
```

## 25 Effects

| Effect | Description |
|--------|------------|
| `liquid` | Characters morph and flow like water |
| `glitch` | Random offset, color split, character swap |
| `typewriter` | Types out with realistic timing and mistakes |
| `handwriting` | Pen stroke wobble, tilt, gradual reveal |
| `gravity` | Characters fall from above and bounce |
| `magnetic` | Characters repel from cursor position |
| `wave` | Sine wave propagation through text |
| `scramble` | Random characters resolve to real text |
| `fade` | Staggered fade-in with upward drift |
| `bounce` | Spring physics bounce per character |
| `split` | Characters fly in from random directions |
| `blur` | Focus sweep from blurry to sharp |
| `rotate` | Characters rotate into place |
| `scale` | Characters scale up from zero with elastic |
| `slide` | Characters slide in alternating directions |
| `rainbow` | Cycling hue per character |
| `neon` | Neon glow flicker effect |
| `matrix` | Green rain resolving to text |
| `shatter` | Text appears whole then shatters outward |
| `elastic` | Spring overshoot on each character |
| `breath` | Continuous gentle scale breathing (loops) |
| `flicker` | Random opacity like old film |
| `drip` | Characters drip downward like paint |
| `magnet` | Characters snap together from scattered |
| `phantom` | Ghost trails following each character |

## Props

| Prop | Default | Description |
|------|---------|------------|
| `text` | required | Text to animate |
| `effect` | `'fade'` | Effect name |
| `duration` | `1000` | Animation duration in ms |
| `stagger` | `30` | Delay between characters in ms |
| `trigger` | `'mount'` | When to start: mount, hover, click, scroll, manual |
| `loop` | `false` | Loop the animation |
| `loopDelay` | `2000` | Delay between loops in ms |
| `color` | inherit | Text color |
| `fontSize` | inherit | Font size in px |
| `fontFamily` | inherit | Font family |
| `fontWeight` | inherit | Font weight |
| `interactive` | `true` | Cursor-reactive |
| `speed` | `1` | Speed multiplier |
| `intensity` | `1` | Effect intensity 0-1 |
| `as` | `'span'` | HTML tag to render |
| `onComplete` | - | Callback when done |

## Vanilla JS

```js
import { animateText } from 'typoui'

const el = document.querySelector('.title')
const stop = animateText(el, 'Hello World', 'gravity', { duration: 1500 })

// Later
stop()
```

## Disclaimer

Experimental, open-source software. Provided as-is. No warranties. DYOR. Built by [0xDragoon](https://github.com/dragoon0x).

## License

MIT
