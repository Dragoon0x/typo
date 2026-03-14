var tp = require('../dist/index.js')
var passed = 0, failed = 0
function assert(c, m) { if (c) { passed++; console.log('  ✓ ' + m) } else { failed++; console.error('  ✗ ' + m) } }
function assertEq(a, b, m) { assert(a === b, m + ' (got: ' + JSON.stringify(a) + ', exp: ' + JSON.stringify(b) + ')') }

console.log('\n  Exports')
assert(typeof tp.Typo === 'function', 'Typo component')
assert(typeof tp.animateText === 'function', 'animateText fn')
assert(typeof tp.getEffect === 'function', 'getEffect fn')
assert(typeof tp.getAllEffectNames === 'function', 'getAllEffectNames fn')
assert(Array.isArray(tp.ALL_EFFECTS), 'ALL_EFFECTS array')
assertEq(tp.ALL_EFFECTS.length, 76, '76 effects')

console.log('\n  Effects')
var names = tp.getAllEffectNames()
assertEq(names.length, 76, 'getAllEffectNames returns 76')

var expected = ['liquid','glitch','typewriter','handwriting','gravity','magnetic','wave','scramble','fade','bounce','split','blur','rotate','scale','slide','rainbow','neon','matrix','shatter','elastic','breath','flicker','drip','magnet','phantom',
'spiral','cascade','rubberband','swing','unfold','pixelate','spring','tornado','domino','inflate','x-ray','ticker','pop','earthquake','dissolve','origami','spotlight','morse','rippletext','conveyor','pendulum','static','emerge','float','vhs','stamp','orbit','rewind','thermal','pulse','slash','cipher','levitate','whip','cascade3d','melt','assemble','vertigo','radar','firework','telegraph','unfurl','sway','jitter','crash','warp','scatter','tilt','glow','countdown','ricochet']
for (var i = 0; i < expected.length; i++) {
  assert(names.includes(expected[i]), 'Has effect: ' + expected[i])
}

console.log('\n  Effect Functions')
var dummyCtx = { duration: 1000, stagger: 30, intensity: 1, mouseX: 500, mouseY: 300, charRects: [new (function DOMRect(){this.left=0;this.top=0;this.width=10;this.height=20;this.right=10;this.bottom=20;this.x=0;this.y=0})()], scrollProgress: 0 }

for (var i = 0; i < expected.length; i++) {
  var fn = tp.getEffect(expected[i])
  assert(typeof fn === 'function', expected[i] + ' is a function')
  
  // Test at progress 0
  var s0 = fn(0, 0, 10, 0, dummyCtx)
  assert(typeof s0.opacity === 'number', expected[i] + ' returns opacity at p=0')
  assert(typeof s0.transform === 'string', expected[i] + ' returns transform at p=0')
  
  // Test at progress 1
  var s1 = fn(1, 0, 10, 1, dummyCtx)
  assert(typeof s1.opacity === 'number', expected[i] + ' returns opacity at p=1')
  
  // Test mid-progress
  var sm = fn(0.5, 5, 10, 0.5, dummyCtx)
  assert(typeof sm.opacity === 'number', expected[i] + ' returns opacity at p=0.5')
}

console.log('\n  Effect Properties')
// Fade should be fully visible at p=1
var fadeEnd = tp.getEffect('fade')(1, 0, 10, 1, dummyCtx)
assert(fadeEnd.opacity >= 0.9, 'Fade at p=1 is opaque (' + fadeEnd.opacity.toFixed(2) + ')')

// Glitch should sometimes have color
var glitchCount = 0
for (var i = 0; i < 20; i++) {
  var gs = tp.getEffect('glitch')(0.3, 0, 10, i * 0.1, dummyCtx)
  if (gs.color) glitchCount++
}
assert(glitchCount > 0, 'Glitch produces color variations')

// Rainbow should have hsl color
var rbw = tp.getEffect('rainbow')(0.8, 3, 10, 1, dummyCtx)
assert(rbw.color && rbw.color.startsWith('hsl'), 'Rainbow has hsl color')

// Neon should have textShadow
var neon = tp.getEffect('neon')(1, 0, 10, 1, dummyCtx)
assert(neon.textShadow !== undefined, 'Neon has textShadow')

// Shatter visible at start, fading at end
var shStart = tp.getEffect('shatter')(0.1, 0, 10, 0, dummyCtx)
assertEq(shStart.opacity, 1, 'Shatter visible at start')
var shEnd = tp.getEffect('shatter')(1, 0, 10, 1, dummyCtx)
assert(shEnd.opacity < 0.5, 'Shatter faded at end')

// Breath is continuous — always visible
var br = tp.getEffect('breath')(0, 0, 10, 5, dummyCtx)
assert(br.opacity > 0.5, 'Breath always visible')

console.log('\n  Fallback')
var fallback = tp.getEffect('nonexistent_mode')
assert(typeof fallback === 'function', 'Unknown effect falls back to function')
var fs = fallback(0.5, 0, 10, 0, dummyCtx)
assert(typeof fs.opacity === 'number', 'Fallback returns valid style')

console.log('\n  ' + passed + ' passed, ' + failed + ' failed\n')
process.exit(failed > 0 ? 1 : 0)
