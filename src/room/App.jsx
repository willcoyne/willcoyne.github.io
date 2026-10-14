import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
import Player, { SPAWN, savedPose } from './Player'
import Joystick from './Joystick'
import { EMAIL, RESUME_URL, badges, grocerez, isExternal, links, projects } from './content'

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
function enterLabel(intro, entering) {
  if (entering) return 'one sec…'
  if (!intro) return 'back to the room'
  const verb = TOUCH ? 'tap' : 'click'
  return savedPose ? `${verb} to go back into the room` : `${verb} to enter the room`
}

function Menu({ intro, entering, onEnter, onResume }) {
  return (
    <div className="overlay">
      <div className="card">
        <h1>will coyne</h1>
        <p className="sub">{EMAIL}</p>

        <button className="enter" type="button" onClick={onEnter} autoFocus>
          {enterLabel(intro, entering)}
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
          <a className="row" href={grocerez.href} {...ext(grocerez.href)}>
            <span className="k">{grocerez.title}</span><span className="v">{grocerez.tagline}, HackMidwest 2026</span>
          </a>
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
          <h2>badges</h2>
          {badges.map((b) => b.href ? (
            <a key={b.id} className="row" href={b.href} {...ext(b.href)}><span className="v">{b.label}</span></a>
          ) : (
            <div key={b.id} className="row"><span className="v">{b.label}</span></div>
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
  const [entering, setEntering] = useState(false)
  const [toast, setToast] = useState(null)
  const canvasRef = useRef(null)
  const toastTimer = useRef(0)

  const enter = useCallback(() => {
    if (TOUCH) { setMode('playing'); return }
    setEntering(true)
    setTimeout(() => setEntering(false), 3000) // browsers that never report a failure
    // Chrome refuses to re-lock for about a second after Esc. The click still
    // counts as a user gesture a moment later, so retry once before giving up.
    const tryLock = (retry) => {
      const fail = () => (retry ? setTimeout(() => tryLock(false), 1100) : setEntering(false))
      try {
        canvasRef.current?.requestPointerLock()?.catch?.(fail)
      } catch {
        fail()
      }
    }
    tryLock(true)
  }, [])

  // Tapping a badge with no link just shows its label for a moment.
  const flash = useCallback((text) => {
    setToast(text)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2500)
  }, [])

  const release = useCallback(() => {
    if (document.pointerLockElement) document.exitPointerLock()
  }, [])

  useEffect(() => {
    const change = () => {
      const locked = document.pointerLockElement === canvasRef.current
      if (locked) setEntering(false)
      setMode((m) => (locked ? 'playing' : m === 'playing' ? 'paused' : m))
    }
    document.addEventListener('pointerlockchange', change)
    return () => document.removeEventListener('pointerlockchange', change)
  }, [])

  const activate = useCallback((ex) => {
    const a = ex.action
    if (!a) {
      flash(ex.label)
    } else if (a.type === 'resume') {
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
  }, [release, flash])

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
              {hovered.action && <><kbd>click</kbd>{' '}</>}{hovered.label}{hovered.action?.newTab ? ' ↗' : ''}
            </div>
          )}
          {TOUCH && toast && <div className="hint">{toast}</div>}
          <div className="corner">
            {TOUCH
              ? <button type="button" className="btn" onClick={() => setMode('paused')}>menu</button>
              : <span><kbd>esc</kbd> menu</span>}
          </div>
          {TOUCH && <Joystick />}
        </div>
      )}

      {(mode === 'intro' || mode === 'paused') && (
        <Menu intro={mode === 'intro'} entering={entering} onEnter={enter} onResume={() => setMode('resume')} />
      )}
      {mode === 'resume' && <ResumeViewer onClose={closeResume} />}
    </div>
  )
}
