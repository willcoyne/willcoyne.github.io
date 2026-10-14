// Wall art is painted with the 2D canvas API and uploaded as textures. That keeps
// text crisp, needs no font files, and matches the monospace look of the old site.
import * as THREE from 'three'

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace'
const PPU = 512 // canvas pixels per world unit
const MAX = 2048

export const INK = '#1d1f24'
export const MUTED = '#6b7280'
export const PAPER = '#fbfaf7'
export const GOLD = '#c99a1e'

const font = (px, weight = 500) => `${weight} ${px}px ${MONO}`

// Paint a w x h (world units) texture. `draw` gets the context plus the canvas size.
export function paint(w, h, draw, { transparent = false } = {}) {
  const scale = Math.min(PPU, MAX / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  const ctx = canvas.getContext('2d')
  if (!transparent) {
    ctx.fillStyle = PAPER
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.textBaseline = 'alphabetic'
  draw(ctx, canvas.width, canvas.height)
  return toTexture(canvas)
}

export function toTexture(canvas) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

// Greedy word wrap; returns the y below the last line.
function wrap(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const words = text.split(' ')
  let line = ''
  let lines = 0
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i]
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(lines === maxLines - 1 ? `${line}…` : line, x, y)
      if (++lines === maxLines) return y + lineHeight
      line = words[i]
      y += lineHeight
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, y)
  return y + lineHeight
}

// Shrink the font until `text` fits in maxWidth.
function fit(ctx, text, px, maxWidth, weight) {
  while (px > 10) {
    ctx.font = font(px, weight)
    if (ctx.measureText(text).width <= maxWidth) break
    px -= 2
  }
  return px
}

export function projectCard(p, index, w, h) {
  return paint(w, h, (ctx, W, H) => {
    const pad = W * 0.08
    if (p.pinned) {
      ctx.fillStyle = 'rgba(201,154,30,0.10)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = GOLD
      ctx.fillRect(0, 0, W * 0.025, H)
    }
    ctx.fillStyle = p.pinned ? GOLD : MUTED
    ctx.font = font(H * 0.07)
    ctx.fillText(p.pinned ? '★ FEATURED' : `PROJECT ${String(index + 1).padStart(2, '0')}`, pad, pad + H * 0.07)

    ctx.fillStyle = INK
    fit(ctx, p.title, H * 0.2, W - pad * 2, 600)
    ctx.fillText(p.title, pad, H * 0.43)

    ctx.fillStyle = MUTED
    ctx.font = font(H * 0.075)
    wrap(ctx, p.blurb, pad, H * 0.58, W - pad * 2, H * 0.1, 3)

    ctx.fillStyle = INK
    fit(ctx, `↗ ${p.host}`, H * 0.065, W - pad * 2)
    ctx.fillText(`↗ ${p.host}`, pad, H - pad)
  })
}

export function grocerezCard(g, w, h) {
  return paint(w, h, (ctx, W, H) => {
    const pad = W * 0.07
    ctx.fillStyle = '#2f7d4f'
    ctx.fillRect(0, 0, W, H * 0.02)
    ctx.fillStyle = GOLD
    ctx.font = font(H * 0.045, 600)
    ctx.fillText(`★ ${g.kicker}`, pad, pad + H * 0.03)

    ctx.fillStyle = INK
    ctx.font = font(H * 0.13, 700)
    ctx.fillText(g.title, pad, H * 0.26)
    ctx.fillStyle = MUTED
    ctx.font = font(H * 0.048)
    ctx.fillText(g.tagline, pad, H * 0.34)

    ctx.font = font(H * 0.042)
    let y = H * 0.46
    for (const pt of g.points) {
      ctx.fillStyle = '#2f7d4f'
      ctx.fillText('▸', pad, y)
      ctx.fillStyle = INK
      y = wrap(ctx, pt, pad + H * 0.05, y, W - pad * 2 - H * 0.05, H * 0.055, 2) + H * 0.02
    }

    ctx.fillStyle = MUTED
    fit(ctx, g.status, H * 0.04, W - pad * 2)
    ctx.fillText(g.status, pad, H - pad - H * 0.075)
    ctx.fillStyle = INK
    fit(ctx, `↗ ${g.host}`, H * 0.045, W - pad * 2, 600)
    ctx.fillText(`↗ ${g.host}`, pad, H - pad)
  })
}

function badgePath(ctx, shape, cx, cy, r) {
  ctx.beginPath()
  if (shape === 'hex') {
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 6 + (i * Math.PI) / 3
      ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
    }
    ctx.closePath()
  } else if (shape === 'shield') {
    ctx.moveTo(cx - r * 0.85, cy - r * 0.9)
    ctx.lineTo(cx + r * 0.85, cy - r * 0.9)
    ctx.lineTo(cx + r * 0.85, cy + r * 0.05)
    ctx.quadraticCurveTo(cx + r * 0.8, cy + r * 0.75, cx, cy + r)
    ctx.quadraticCurveTo(cx - r * 0.8, cy + r * 0.75, cx - r * 0.85, cy + r * 0.05)
    ctx.closePath()
  } else {
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
  }
}

// A medal-style badge with a caption underneath, on a transparent background.
export function badge(b, w, h) {
  return paint(w, h, (ctx, W, H) => {
    const cx = W / 2, cy = W / 2, r = W * 0.43
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.28)'
    ctx.shadowBlur = W * 0.04
    ctx.shadowOffsetY = W * 0.015
    badgePath(ctx, b.shape, cx, cy, r)
    ctx.fillStyle = b.color
    ctx.fill()
    ctx.restore()

    // light sheen + inner rim
    const g = ctx.createLinearGradient(0, cy - r, 0, cy + r)
    g.addColorStop(0, 'rgba(255,255,255,0.22)')
    g.addColorStop(0.55, 'rgba(255,255,255,0)')
    badgePath(ctx, b.shape, cx, cy, r)
    ctx.fillStyle = g
    ctx.fill()
    badgePath(ctx, b.shape, cx, cy, r * 0.86)
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'
    ctx.lineWidth = W * 0.012
    ctx.stroke()

    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    fit(ctx, b.top.toUpperCase(), W * 0.075, r * 1.3, 600)
    ctx.fillText(b.top.toUpperCase(), cx, cy - r * 0.32)
    fit(ctx, b.big, W * 0.2, r * 1.5, 700)
    ctx.fillText(b.big, cx, cy + r * 0.14)
    fit(ctx, b.bottom.toUpperCase(), W * 0.07, r * 1.2, 500)
    ctx.fillText(b.bottom.toUpperCase(), cx, cy + r * 0.48)

    ctx.fillStyle = INK
    fit(ctx, b.caption, W * 0.075, W * 0.98, 500)
    ctx.fillText(b.caption, cx, H - H * 0.04)
  }, { transparent: true })
}

// Louvred door slats for the GrocerEZ pantry cabinet.
export function louvres() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#b98352'
  ctx.fillRect(0, 0, 128, 256)
  ctx.fillStyle = 'rgba(70,40,15,0.35)'
  for (let y = 26; y < 232; y += 12) ctx.fillRect(16, y, 96, 5)
  ctx.strokeStyle = 'rgba(70,40,15,0.45)'
  ctx.lineWidth = 6
  ctx.strokeRect(10, 10, 108, 236)
  return toTexture(canvas)
}

export function linkCard(l, w, h) {
  return paint(w, h, (ctx, W, H) => {
    const pad = H * 0.14
    const s = H - pad * 2
    ctx.fillStyle = l.color
    ctx.fillRect(pad, pad, s, s)
    ctx.fillStyle = '#fff'
    ctx.font = font(s * 0.48, 700)
    ctx.textAlign = 'center'
    ctx.fillText(l.mark, pad + s / 2, pad + s * 0.66)
    ctx.textAlign = 'left'

    const x = pad * 2 + s
    ctx.fillStyle = INK
    fit(ctx, l.title, H * 0.26, W - x - pad, 600)
    ctx.fillText(l.title, x, H * 0.48)
    ctx.fillStyle = MUTED
    fit(ctx, l.handle, H * 0.13, W - x - pad)
    ctx.fillText(l.handle, x, H * 0.72)
  })
}

export function nameCard(email, w, h) {
  return paint(w, h, (ctx, W, H) => {
    const pad = W * 0.08
    ctx.fillStyle = INK
    fit(ctx, 'will coyne', H * 0.2, W - pad * 2, 600)
    ctx.fillText('will coyne', pad, H * 0.34)
    ctx.fillStyle = MUTED
    ctx.font = font(H * 0.075)
    ctx.fillText(email, pad, H * 0.48)

    ctx.fillStyle = INK
    ctx.font = font(H * 0.062)
    const rows = ['← projects', '→ links', '↻ behind you: GrocerEZ + badges']
    rows.forEach((r, i) => ctx.fillText(r, pad, H * 0.66 + i * H * 0.085))
  })
}

export function noteCard(title, note, w, h) {
  return paint(w, h, (ctx, W, H) => {
    const pad = W * 0.1
    ctx.fillStyle = INK
    ctx.font = font(H * 0.24, 600)
    ctx.fillText(title, pad, H * 0.45)
    ctx.fillStyle = MUTED
    ctx.font = font(H * 0.1)
    ctx.fillText(note, pad, H * 0.7)
  })
}

export function plaque(label, w, h) {
  return paint(w, h, (ctx, W, H) => {
    ctx.fillStyle = INK
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = PAPER
    fit(ctx, label, H * 0.42, W * 0.86, 500)
    ctx.textAlign = 'center'
    ctx.fillText(label, W / 2, H * 0.64)
  })
}

export function header(text, w, h) {
  return paint(w, h, (ctx, W, H) => {
    ctx.fillStyle = 'rgba(29,31,36,0.82)'
    ctx.font = font(H * 0.62, 500)
    ctx.textAlign = 'center'
    ctx.letterSpacing = `${Math.round(H * 0.18)}px`
    ctx.fillText(text.toUpperCase(), W / 2, H * 0.74)
  }, { transparent: true })
}

export function doorPanel(w, h) {
  return paint(w, h, (ctx, W, H) => {
    ctx.fillStyle = '#2a2d34'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'
    ctx.lineWidth = W * 0.012
    const inset = W * 0.12
    ctx.strokeRect(inset, inset, W - inset * 2, H * 0.4)
    ctx.strokeRect(inset, H * 0.5, W - inset * 2, H * 0.42)
    // brass knob
    ctx.fillStyle = '#c9a75a'
    ctx.beginPath()
    ctx.arc(W * 0.82, H * 0.52, W * 0.035, 0, Math.PI * 2)
    ctx.fill()
  })
}

export function resumePlaceholder(w, h, message) {
  return paint(w, h, (ctx, W, H) => {
    const pad = W * 0.1
    ctx.fillStyle = INK
    ctx.font = font(W * 0.1, 600)
    ctx.fillText('resume', pad, H * 0.2)
    ctx.fillStyle = 'rgba(0,0,0,0.08)'
    for (let i = 0; i < 14; i++) ctx.fillRect(pad, H * 0.3 + i * H * 0.045, (W - pad * 2) * (i % 3 === 2 ? 0.6 : 1), H * 0.015)
    ctx.fillStyle = MUTED
    ctx.font = font(W * 0.05)
    ctx.fillText(message, pad, H * 0.94)
  })
}

// Pale floor tiles; the seams give you a sense of speed while walking.
export function floorTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#d9d6cf'
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 1600; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.025})`
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2)
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.10)'
  ctx.lineWidth = 3
  ctx.strokeRect(0, 0, 512, 512)
  const tex = toTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

export function floorDecal(touch, w, h) {
  return paint(w, h, (ctx, W, H) => {
    ctx.fillStyle = 'rgba(29,31,36,0.55)'
    ctx.textAlign = 'center'
    ctx.font = font(H * 0.16, 600)
    ctx.fillText(touch ? 'drag to look' : 'W A S D', W / 2, H * 0.4)
    ctx.font = font(H * 0.1)
    ctx.fillText(touch ? 'joystick to move · tap to open' : 'mouse to look · click to open', W / 2, H * 0.7)
  }, { transparent: true })
}
