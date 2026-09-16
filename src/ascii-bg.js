// Animated ASCII art of "WILL COYNE" as a page background.
// One grid, five themes; each theme is just (x,y,t) -> character.

const GW = 5, GH = 7
const FONT = {
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  N: ['#...#', '##..#', '#.#.#', '#.#.#', '#..##', '#...#', '#...#'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
}
// Monospace cells are ~0.6 as wide as tall, so stretch horizontally to keep letters square.
const ASPECT = 1.7
const textWidth = (line) => line.length * (GW + 1) - 1

// mask[y * cols + x] === 1 where the name's glyphs are lit.
export function buildMask(cols, rows) {
  // One line when there is room for it, otherwise stack the two words.
  const lines = cols * 0.9 >= textWidth('WILL COYNE') ? ['WILL COYNE'] : ['WILL', 'COYNE']
  const width = Math.max(...lines.map(textWidth))
  const height = lines.length * GH + (lines.length - 1) // one blank row between lines

  // Fit inside the grid first, then keep the glyphs square.
  let sx = Math.max(1, Math.floor((cols * 0.9) / width))
  let sy = Math.max(1, Math.floor((rows * 0.6) / height))
  sy = Math.min(sy, Math.max(1, Math.round(sx / ASPECT)))
  sx = Math.min(sx, Math.max(1, Math.round(sy * ASPECT)))

  const x0 = Math.max(0, Math.floor((cols - width * sx) / 2))
  const y0 = Math.max(0, Math.floor((rows - height * sy) / 2))
  const mask = new Uint8Array(cols * rows)

  lines.forEach((line, li) => {
    const lineX = x0 + Math.floor(((width - textWidth(line)) * sx) / 2)
    const lineY = y0 + li * (GH + 1) * sy
    for (let i = 0; i < line.length; i++) {
      const glyph = FONT[line[i]]
      for (let gy = 0; gy < GH; gy++) {
        for (let gx = 0; gx < GW; gx++) {
          if (glyph[gy][gx] !== '#') continue
          const bx = lineX + (i * (GW + 1) + gx) * sx
          const by = lineY + gy * sy
          for (let dy = 0; dy < sy; dy++) {
            for (let dx = 0; dx < sx; dx++) {
              const x = bx + dx, y = by + dy
              if (x >= 0 && x < cols && y >= 0 && y < rows) mask[y * cols + x] = 1
            }
          }
        }
      }
    }
  })
  return { mask, cols, rows, x0, y0, sx, sy, lines }
}

// Cheap deterministic noise so themes look random without keeping state.
function rnd(x, y, seed) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453
  return n - Math.floor(n)
}
const pick = (str, r) => str[Math.floor(r * str.length) % str.length]

const THEMES = [
  {
    id: 'matrix',
    label: 'Matrix',
    field(x, y, t, rows) {
      const speed = 1 + Math.floor(rnd(x, 0, 1) * 3)
      const head = (t * speed + Math.floor(rnd(x, 1, 1) * rows * 2)) % (rows + 24)
      const d = head - y
      if (d < 0 || d > 11) return ' '
      return pick('01アイウエオカキク', rnd(x, y, Math.floor(t / 3)))
    },
    glyph: (x, y, t) => pick('01', rnd(x, y, Math.floor(t / 4))),
  },
  {
    id: 'wave',
    label: 'Ocean',
    field(x, y, t) {
      const v = Math.sin(x * 0.11 + t * 0.09) + Math.sin(y * 0.31 - t * 0.05)
      return v > 1.1 ? '≈' : v > 0.4 ? '~' : v > -0.3 ? '·' : ' '
    },
    glyph: (x, y, t) => (Math.sin(t * 0.12 + x * 0.06) > 0 ? '▓' : '▒'),
  },
  {
    id: 'fire',
    label: 'Embers',
    field(x, y, t, rows) {
      const heat = 1 - y / rows
      const r = rnd(x, y + Math.floor(t * 0.7), 2)
      return r < heat * 0.55 ? pick('.:*^#', r / (heat * 0.55 || 1)) : ' '
    },
    glyph: (x, y, t) => pick('▒▓█', rnd(x, y, Math.floor(t / 2))),
  },
  {
    id: 'stars',
    label: 'Starfield',
    field(x, y, t) {
      const dx = x + Math.floor(t * 0.2)
      if (rnd(dx, y, 3) < 0.975) return ' '
      return rnd(dx, y, Math.floor(t / 4)) > 0.55 ? '✦' : '·'
    },
    glyph: (x, y, t) => (rnd(x, y, Math.floor(t / 5)) > 0.25 ? '*' : '+'),
  },
  {
    id: 'circuit',
    label: 'Circuit',
    field(x, y, t) {
      if ((x + t * 2) % 47 < 2) return '•'
      if (y % 4 === 0) return x % 8 === 0 ? '┼' : '─'
      return x % 8 === 0 ? '│' : ' '
    },
    glyph: (x, y, t) => pick('01', rnd(x, y, Math.floor(t / 6))),
  },
]

const field = document.getElementById('ascii-field')
const glyphs = document.getElementById('ascii-glyph')
const button = document.getElementById('theme-btn')
if (field && glyphs && button) start()

function start() {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches
  let grid = layout()
  let theme = 0
  let t = 0

  function layout() {
    const probe = document.createElement('pre')
    probe.className = 'ascii-art'
    probe.style.cssText = 'position:absolute;visibility:hidden'
    probe.textContent = '0'.repeat(50) + '\n0'
    document.body.appendChild(probe)
    const box = probe.getBoundingClientRect()
    probe.remove()
    const cw = box.width / 50, ch = box.height / 2
    return buildMask(Math.ceil(innerWidth / cw) + 1, Math.ceil(innerHeight / ch) + 1)
  }

  function draw() {
    const { mask, cols, rows } = grid
    const th = THEMES[theme]
    const bg = [], fg = []
    for (let y = 0; y < rows; y++) {
      const bgRow = [], fgRow = []
      for (let x = 0; x < cols; x++) {
        const lit = mask[y * cols + x] === 1
        bgRow.push(lit ? ' ' : th.field(x, y, t, rows))
        fgRow.push(lit ? th.glyph(x, y, t) : ' ')
      }
      bg.push(bgRow.join(''))
      fg.push(fgRow.join(''))
    }
    field.textContent = bg.join('\n')
    glyphs.textContent = fg.join('\n')
  }

  function apply() {
    document.body.dataset.theme = THEMES[theme].id
    button.textContent = 'Theme: ' + THEMES[theme].label
    draw()
  }

  button.hidden = false
  button.addEventListener('click', () => {
    theme = (theme + 1) % THEMES.length
    apply()
  })

  let resizeTimer
  addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => { grid = layout(); draw() }, 200)
  })

  apply()
  if (!still) setInterval(() => { t++; draw() }, 100)
}
