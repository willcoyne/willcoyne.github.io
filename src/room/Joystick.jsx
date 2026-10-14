// On-screen thumbstick for touch devices. Writes into `stick`, which the player
// reads every frame alongside the keyboard.
import { useEffect, useRef, useState } from 'react'

export const stick = { x: 0, y: 0 }
const R = 48 // px the knob can travel from center

export default function Joystick() {
  const base = useRef(null)
  const [knob, setKnob] = useState([0, 0])
  const pointer = useRef(null)
  useEffect(() => () => { stick.x = stick.y = 0 }, [])

  const move = (e) => {
    const b = base.current.getBoundingClientRect()
    let dx = e.clientX - (b.left + b.width / 2)
    let dy = e.clientY - (b.top + b.height / 2)
    const d = Math.hypot(dx, dy)
    if (d > R) { dx *= R / d; dy *= R / d }
    stick.x = dx / R
    stick.y = -dy / R
    setKnob([dx, dy])
  }
  const end = (e) => {
    if (e.pointerId !== pointer.current) return
    pointer.current = null
    stick.x = stick.y = 0
    setKnob([0, 0])
  }

  return (
    <div
      ref={base}
      className="joystick"
      aria-hidden="true"
      onPointerDown={(e) => {
        pointer.current = e.pointerId
        try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* pointer already gone */ }
        move(e)
      }}
      onPointerMove={(e) => { if (e.pointerId === pointer.current) move(e) }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="joystick-knob" style={{ transform: `translate(${knob[0]}px, ${knob[1]}px)` }} />
    </div>
  )
}
