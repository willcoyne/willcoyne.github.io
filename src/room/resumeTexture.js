// Renders page 1 of the resume PDF onto a canvas so the wall always shows the
// current file. pdf.js is loaded on demand so it never blocks the first frame.
import { toTexture } from './textures'

export async function loadResumeTexture(url, targetWidth = 1400) {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href

  const task = pdfjs.getDocument({ url })
  try {
    const doc = await task.promise
    const page = await doc.getPage(1)
    const base = page.getViewport({ scale: 1 })
    const viewport = page.getViewport({ scale: targetWidth / base.width })
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(viewport.width)
    canvas.height = Math.round(viewport.height)
    await page.render({ canvas, viewport }).promise
    return { texture: toTexture(canvas), aspect: viewport.width / viewport.height }
  } finally {
    task.destroy()
  }
}
