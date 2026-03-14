// ═══════════════════════════════════════════
// TYPO — React Component
// ═══════════════════════════════════════════

import React, { useRef, useEffect, useState, useCallback } from 'react'
import type { TypoProps } from '../types'
import { getEffect, type CharStyle, type EffectCtx } from '../core/effects'

export function Typo({
  text, effect = 'fade', duration = 1000, stagger = 30,
  trigger = 'mount', loop = false, loopDelay = 2000,
  color, fontSize, fontFamily, fontWeight,
  interactive = true, easing = 'ease-out',
  className, style, onComplete, speed = 1, intensity = 1,
  as: Tag = 'span',
}: TypoProps) {
  const containerRef = useRef<HTMLElement>(null)
  const charRefs = useRef<(HTMLSpanElement | null)[]>([])
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0 })
  const [playing, setPlaying] = useState(trigger === 'mount')
  const [charStyles, setCharStyles] = useState<CharStyle[]>([])
  const timeRef = useRef(0)

  const chars = text.split('')

  const animate = useCallback(() => {
    const now = performance.now()
    if (!startTimeRef.current) startTimeRef.current = now
    const elapsed = (now - startTimeRef.current) * speed
    const progress = Math.min(1, elapsed / duration)
    timeRef.current += 0.016 * speed

    const effectFn = getEffect(effect)
    const rects = charRefs.current.map(el => el?.getBoundingClientRect() || new DOMRect())

    const ctx: EffectCtx = {
      duration, stagger, intensity,
      mouseX: mouseRef.current.x,
      mouseY: mouseRef.current.y,
      charRects: rects,
      scrollProgress: 0,
    }

    const styles = chars.map((_, i) => effectFn(progress, i, chars.length, timeRef.current, ctx))
    setCharStyles(styles)

    if (progress < 1 || effect === 'breath' || effect === 'wave' || effect === 'magnetic' || effect === 'rainbow') {
      rafRef.current = requestAnimationFrame(animate)
    } else if (loop) {
      setTimeout(() => {
        startTimeRef.current = 0
        timeRef.current = 0
        rafRef.current = requestAnimationFrame(animate)
      }, loopDelay)
    } else {
      onComplete?.()
    }
  }, [text, effect, duration, stagger, speed, intensity, loop, loopDelay, onComplete])

  // Start/stop
  useEffect(() => {
    if (playing) {
      startTimeRef.current = 0
      timeRef.current = 0
      rafRef.current = requestAnimationFrame(animate)
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [playing, animate])

  // Trigger on mount
  useEffect(() => {
    if (trigger === 'mount') setPlaying(true)
  }, [trigger])

  // Mouse tracking
  useEffect(() => {
    if (!interactive) return
    const handler = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [interactive])

  // Scroll trigger
  useEffect(() => {
    if (trigger !== 'scroll') return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !playing) setPlaying(true)
    }, { threshold: 0.3 })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [trigger, playing])

  const handleInteraction = useCallback(() => {
    if ((trigger === 'hover' || trigger === 'click') && !playing) {
      setPlaying(true)
    }
    if (trigger === 'manual') {
      startTimeRef.current = 0
      timeRef.current = 0
      setPlaying(true)
    }
  }, [trigger, playing])

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    flexWrap: 'wrap',
    color,
    fontSize: fontSize ? `${fontSize}px` : undefined,
    fontFamily,
    fontWeight,
    ...style,
  }

  return React.createElement(
    Tag,
    {
      ref: containerRef as any,
      className,
      style: containerStyle,
      onClick: trigger === 'click' ? handleInteraction : undefined,
      onMouseEnter: trigger === 'hover' ? handleInteraction : undefined,
      'aria-label': text,
      role: 'text' as any,
    },
    chars.map((char, i) => {
      const cs = charStyles[i]
      const charStyle: React.CSSProperties = cs ? {
        display: 'inline-block',
        opacity: cs.opacity,
        transform: cs.transform,
        color: cs.color || undefined,
        textShadow: cs.textShadow || undefined,
        filter: cs.filter || undefined,
        transition: 'none',
        whiteSpace: char === ' ' ? 'pre' : undefined,
        willChange: 'transform, opacity',
      } : {
        display: 'inline-block',
        opacity: trigger === 'mount' ? 0 : 1,
        whiteSpace: char === ' ' ? 'pre' : undefined,
      }

      return React.createElement('span', {
        key: i,
        ref: (el: HTMLSpanElement | null) => { charRefs.current[i] = el },
        style: charStyle,
        'aria-hidden': 'true',
      }, cs?.letterContent || char)
    })
  )
}

// ─── Imperative API for vanilla JS ───

export function animateText(element: HTMLElement, text: string, effect: string, config?: Partial<import('../types').TypoConfig>): () => void {
  const chars = text.split('')
  element.innerHTML = ''
  const spans: HTMLSpanElement[] = []

  for (const char of chars) {
    const span = document.createElement('span')
    span.style.display = 'inline-block'
    span.style.willChange = 'transform, opacity'
    if (char === ' ') span.style.whiteSpace = 'pre'
    span.textContent = char
    element.appendChild(span)
    spans.push(span)
  }

  const effectFn = getEffect(effect as any)
  const duration = config?.duration || 1000
  const stagger = config?.stagger || 30
  const intensity = config?.intensity || 1
  const spd = config?.speed || 1
  let startTime = 0
  let time = 0
  let raf = 0
  let mouseX = 0, mouseY = 0

  const onMouse = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY }
  window.addEventListener('mousemove', onMouse, { passive: true })

  function frame(now: number) {
    if (!startTime) startTime = now
    const elapsed = (now - startTime) * spd
    const progress = Math.min(1, elapsed / duration)
    time += 0.016 * spd

    const rects = spans.map(s => s.getBoundingClientRect())
    const ctx: EffectCtx = { duration, stagger, intensity, mouseX, mouseY, charRects: rects, scrollProgress: 0 }

    for (let i = 0; i < spans.length; i++) {
      const cs = effectFn(progress, i, spans.length, time, ctx)
      const s = spans[i].style
      s.opacity = String(cs.opacity)
      s.transform = cs.transform
      if (cs.color) s.color = cs.color
      if (cs.textShadow) s.textShadow = cs.textShadow
      if (cs.filter) s.filter = cs.filter
      if (cs.letterContent) spans[i].textContent = cs.letterContent
      else spans[i].textContent = chars[i]
    }

    const continuous = ['breath', 'wave', 'magnetic', 'rainbow'].includes(effect)
    if (progress < 1 || continuous) {
      raf = requestAnimationFrame(frame)
    } else if (config?.loop) {
      setTimeout(() => { startTime = 0; raf = requestAnimationFrame(frame) }, config.loopDelay || 2000)
    }
  }

  raf = requestAnimationFrame(frame)

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('mousemove', onMouse)
  }
}
