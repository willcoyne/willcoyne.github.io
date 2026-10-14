import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
import Player, { SPAWN } from './Player'
import Joystick from './Joystick'
import { EMAIL, RESUME_URL, isExternal, links, projects } from './content'

// Phones and tablets get drag-to-look and a joystick instead of pointer lock.
const TOUCH = window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches

function downloadResume() {
  const a = document.createElement('a')
  a.href = RESUME_URL
  a.download = 'William Coyne Resume.pdf'
  a.click()
}

const ext = (href) => (isExternal(href) ? { target: '_blank', rel: 'noopener' } : {})

// The Esc menu doubles as a plain list of everything on the walls.
function Menu({ intro, onEnter, onResume }) {
  return (
    <div className="overlay">
      <div className="card">
        <h1>will coyne</h1>
        <p className="sub">{EMAIL}</p>

        <button className="enter" type="button" onClick={onEnter} autoFocus>
          {intro ? (TOUCH ? 'tap to enter the room' : 'click to enter the room') : 'back to the room'}
        </button>

        <ul className="controls">
          {TOUCH ? (
            <>
              <li><kbd>drag</kbd> look around</li>
              <li><kbd>joystick</kbd> walk</li>
              <li><kbd>tap</kbd> open anything on the walls</li>
            </>
          ) : (
            <>
              <li><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> walk <span className="dim">(shift to run)</span></li>
              <li><kbd>mouse</kbd> look around</li>
              <li><kbd>click</kbd> open anything on the walls</li>
              <li><kbd>esc</kbd> this menu</li>
            </>
          )}
        </ul>

        <details className="directory">
          <summary>skip the room: everything as a list</summary>
          <h2>resume</h2>
          <div className="btns">
            <button type="button" className="btn" onClick={onResume}>read</button>
            <button type="button" className="btn" onClick={downloadResume}>download pdf</button>
          </div>
          <h2>projects</h2>
          {projects.map((p) => (
            <a key={p.id} className="row" href={p.href} {...ext(p.href)}>
              <span className="k">{p.title}</span><span className="v">{p.blurb}</span>
            </a>
          ))}
          <h2>links</h2>
          {links.map((l) => (
            <a key={l.id} className="row" href={l.href} {...ext(l.href)}>
              <span className="k">{l.title}</span><span className="v">{l.handle}</span>
            </a>
          ))}
        </details>

        <a className="classic" href="/classic/">classic site →</a>
      </div>
    </div>
  )
}

function ResumeViewer({ onClose }) {
  useEffect(() => {
    const key = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose])

  return (
    <div className="overlay" onClick={onClose}>
      <div className="viewer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="resume">
        <div className="viewer-bar">
          <span>resume</span>
          <div className="btns">
            <button type="button" className="btn" onClick={downloadResume}>download pdf</button>
            <a className="btn" href={RESUME_URL} target="_blank" rel="noopener">open in tab</a>
            <button type="button" className="btn" onClick={onClose} autoFocus>close</button>
          </div>
        </div>
        <iframe src={RESUME_URL} title="resume" />
      </div>
    </div>
  )
}

export default function App() {
  // intro -> playing <-> paused; resume is the PDF viewer on top of the room.
  const [mode, setMode] = useState('intro')
  const [hovered, setHovered] = useState(null)
  const canvasRef = useRef(null)

  const enter = useCallback(() => {
    if (TOUCH) { setMode('playing'); return }
    try {
      // Browsers refuse a re-lock for ~1s after Esc; the menu just stays up until the next click.
      canvasRef.current?.requestPointerLock()?.catch?.(() => {})
    } catch { /* same as above */ }
  }, [])

  const release = useCallback(() => {
    if (document.pointerLockElement) document.exitPointerLock()
  }, [])

  useEffect(() => {
    const change = () => {
      const locked = document.pointerLockElement === canvasRef.current
      setMode((m) => (locked ? 'playing' : m === 'playing' ? 'paused' : m))
    }
    document.addEventListener('pointerlockchange', change)
    return () => document.removeEventListener('pointerlockchange', change)
  }, [])

  const activate = useCallback((ex) => {
    const a = ex.action
    if (a.type === 'resume') {
      setMode('resume')
      release()
    } else if (a.type === 'download') {
      downloadResume()
    } else if (a.type === 'link') {
      if (a.newTab) {
        window.open(a.href, '_blank', 'noopener')
        setMode('paused')
        release()
      } else {
        window.location.href = a.href
      }
    }
  }, [release])

  const closeResume = useCallback(() => setMode('paused'), [])
  const playing = mode === 'playing'

  return (
    <div className={`room ${playing ? 'is-playing' : ''}`}>
      <Canvas
        flat
        dpr={[1, 2]}
        camera={{ fov: 70, near: 0.05, far: 60, position: SPAWN }}
        onCreated={({ gl }) => { canvasRef.current = gl.domElement }}
      >
        <Scene hovered={hovered?.id} touch={TOUCH} />
        <Player active={playing} touch={TOUCH} onHover={setHovered} onActivate={activate} />
      </Canvas>

      {playing && (
        <div className="hud">
          {!TOUCH && <div className={`crosshair ${hovered ? 'on' : ''}`} />}
          {!TOUCH && hovered && (
            <div className="hint">
              <kbd>click</kbd> {hovered.label}{hovered.action.newTab ? ' ↗' : ''}
            </div>
          )}
          <div className="corner">
            {TOUCH
              ? <button type="button" className="btn" onClick={() => setMode('paused')}>menu</button>
              : <span><kbd>esc</kbd> menu</span>}
          </div>
          {TOUCH && <Joystick />}
        </div>
      )}

      {(mode === 'intro' || mode === 'paused') && (
        <Menu intro={mode === 'intro'} onEnter={enter} onResume={() => setMode('resume')} />
      )}
      {mode === 'resume' && <ResumeViewer onClose={closeResume} />}
    </div>
  )
}
