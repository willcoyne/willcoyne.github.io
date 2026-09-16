// node src/ascii-bg.check.mjs -- fails if the name mask stops rendering correctly
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// Drop the browser half of the module so this runs headless.
const src = readFileSync(new URL('./ascii-bg.js', import.meta.url), 'utf8')
const pure = src.slice(0, src.indexOf('const field ='))
const { buildMask } = await import('data:text/javascript,' + encodeURIComponent(pure))

// desktop, laptop, phone (wraps to two lines), oversized
for (const [cols, rows] of [[266, 64], [150, 48], [45, 55], [2000, 400]]) {
  const size = cols + 'x' + rows
  const g = buildMask(cols, rows)
  const at = (x, y) => g.mask[y * cols + x]

  assert.equal(g.mask.length, cols * rows, size + ': mask size')
  assert.ok(g.sx >= 1 && g.sy >= 1, size + ': scale >= 1')
  assert.ok(g.mask.reduce((a, b) => a + b, 0) > 0, size + ': something is lit')
  assert.equal(g.lines.join(' '), 'WILL COYNE', size + ': spells the name')

  // The top row of the leading "W" is "#...#": both stems lit, hollow between them.
  let wx = -1
  for (let x = 0; x < cols && wx < 0; x++) if (at(x, g.y0)) wx = x
  assert.ok(wx >= 0, size + ': first glyph row has pixels')
  assert.equal(at(wx + g.sx, g.y0), 0, size + ': W is hollow')
  assert.equal(at(wx + 4 * g.sx, g.y0), 1, size + ': W right stem lit')

  // Name stays inside the grid and roughly centred.
  let minX = cols, maxX = -1
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (at(x, y)) { if (x < minX) minX = x; if (x > maxX) maxX = x }
    }
  }
  assert.ok(minX >= 0 && maxX < cols, size + ': fits horizontally')
  assert.ok(Math.abs(minX - (cols - 1 - maxX)) <= g.sx + 1, size + ': centred')
}
console.log('ascii-bg: ok')
