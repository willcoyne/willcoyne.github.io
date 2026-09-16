// node src/ascii-bg.check.mjs -- fails if the name mask stops rendering correctly
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// Drop the browser half of the module so this runs headless.
const src = readFileSync(new URL('./ascii-bg.js', import.meta.url), 'utf8')
const pure = src.slice(0, src.indexOf('const field ='))
const { buildMask } = await import('data:text/javascript,' + encodeURIComponent(pure))

// [cols, rows, gutter]: desktop, laptop, oversized
for (const [cols, rows, gutter] of [[266, 78, 80], [190, 55, 40], [600, 200, 200]]) {
  const size = `${cols}x${rows} gutter ${gutter}`
  const g = buildMask(cols, rows, gutter)
  const at = (x, y) => g.mask[y * cols + x]

  assert.equal(g.mask.length, cols * rows, `${size}: mask size`)
  assert.equal(g.words.join(' '), 'WILL COYNE', `${size}: spells the name`)
  assert.ok(g.sx >= 1 && g.sy >= 1, `${size}: scale >= 1`)
  assert.ok(g.mask.reduce((a, b) => a + b, 0) > 0, `${size}: something is lit`)

  // Nothing may land in the content column between the two gutters.
  let left = 0, right = 0
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!at(x, y)) continue
      assert.ok(x < gutter || x >= cols - gutter, `${size}: lit cell ${x},${y} is in a gutter`)
      if (x < gutter) left++; else right++
    }
  }
  assert.ok(left > 0 && right > 0, `${size}: both gutters used`)
  assert.ok(right > left, `${size}: COYNE is bigger than WILL`)

  // Top row of "W" is "#...#": both stems lit, hollow between them.
  let wy = -1, wx = -1
  for (let y = 0; y < rows && wy < 0; y++) {
    for (let x = 0; x < gutter; x++) if (at(x, y)) { wy = y; wx = x; break }
  }
  assert.ok(wy >= 0, `${size}: WILL has pixels`)
  assert.equal(at(wx + g.sx, wy), 0, `${size}: W is hollow`)
  assert.equal(at(wx + 4 * g.sx, wy), 1, `${size}: W right stem lit`)
}

// Too little room beside the content: field animation only, no glyphs.
for (const [cols, rows, gutter] of [[80, 60, 3], [80, 20, 40], [80, 60, 0]]) {
  const g = buildMask(cols, rows, gutter)
  assert.equal(g.mask.reduce((a, b) => a + b, 0), 0, `${cols}x${rows} gutter ${gutter}: blank`)
}
console.log('ascii-bg: ok')
