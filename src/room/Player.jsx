// First-person controller: WASD/arrows to walk, pointer-locked mouse to look, and
// a ray from the crosshair to pick whatever exhibit you are pointing at. On touch
// screens you drag to look, use the joystick to walk, and tap exhibits directly.
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ROOM } from './content'
import { stick } from './Joystick'

const WALK = 3.2
const SPRINT = 5.6
const RADIUS = 0.45 // how close you can get to a wall
const MOUSE_LOOK = 0.0022
const TOUCH_LOOK = 0.005
const MAX_PITCH = Math.PI / 2 - 0.05
const KEYS = {
  KeyW: 'f', ArrowUp: 'f', KeyS: 'b', ArrowDown: 'b',
  KeyA: 'l', ArrowLeft: 'l', KeyD: 'r', ArrowRight: 'r',
  ShiftLeft: 'run', ShiftRight: 'run',
}
export const SPAWN = [0, ROOM.EYE, 1.5]

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// The exhibit record lives on the clickable mesh's userData.
function exhibitAt(raycaster, scene) {
  const hit = raycaster.intersectObjects(scene.children, true)[0]
  return hit?.object.userData.exhibit ?? null
}

export default function Player({ active, touch, onHover, onActivate }) {
  const { camera, gl, scene, size } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const s = useRef({ yaw: 0, pitch: 0, keys: new Set(), vel: new THREE.Vector3(), bob: 0, hovered: null })
  const activeRef = useRef(active)
  activeRef.current = active
  const cb = useRef({ onHover, onActivate })
  cb.current = { onHover, onActivate }

  const setHovered = (ex) => {
    if (s.current.hovered?.id === ex?.id) return
    s.current.hovered = ex
    cb.current.onHover(ex)
  }

  useEffect(() => {
    camera.rotation.order = 'YXZ'
    camera.position.set(...SPAWN)
  }, [camera])

  // Portrait phones get a wider lens so the walls aren't seen through a slot.
  useEffect(() => {
    camera.fov = size.width < size.height ? 90 : 70
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])

  // Drop held keys whenever control is lost, or you keep walking after Esc.
  useEffect(() => {
    if (!active) {
      s.current.keys.clear()
      setHovered(null)
    }
  }, [active])

  useEffect(() => {
    const el = gl.domElement
    const st = s.current
    const locked = () => document.pointerLockElement === el
    const look = (dx, dy, k) => {
      st.yaw -= dx * k
      st.pitch = THREE.MathUtils.clamp(st.pitch - dy * k, -MAX_PITCH, MAX_PITCH)
    }

    const onKey = (down) => (e) => {
      const k = KEYS[e.code]
      if (!k || !activeRef.current) return
      e.preventDefault()
      down ? st.keys.add(k) : st.keys.delete(k)
    }
    const keydown = onKey(true)
    const keyup = onKey(false)
    const blur = () => st.keys.clear()

    const mousemove = (e) => { if (locked()) look(e.movementX, e.movementY, MOUSE_LOOK) }
    const mousedown = (e) => {
      if (e.button === 0 && locked() && st.hovered) cb.current.onActivate(st.hovered)
    }

    // Touch: one finger drags the view; a quick tap picks the exhibit under it.
    let drag = null
    const pointerdown = (e) => {
      if (!touch || !activeRef.current || drag) return
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t: performance.now() }
    }
    const pointermove = (e) => {
      if (!drag || e.pointerId !== drag.id) return
      look(e.clientX - drag.x, e.clientY - drag.y, TOUCH_LOOK)
      drag.x = e.clientX
      drag.y = e.clientY
    }
    const pointerup = (e) => {
      if (!drag || e.pointerId !== drag.id) return
      const moved = Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0)
      if (moved < 10 && performance.now() - drag.t < 350) {
        const r = el.getBoundingClientRect()
        const ndc = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
        raycaster.setFromCamera(ndc, camera)
        const ex = exhibitAt(raycaster, scene)
        if (ex) cb.current.onActivate(ex)
      }
      drag = null
    }

    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)
    window.addEventListener('blur', blur)
    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mousedown', mousedown)
    el.addEventListener('pointerdown', pointerdown)
    window.addEventListener('pointermove', pointermove)
    window.addEventListener('pointerup', pointerup)
    window.addEventListener('pointercancel', pointerup)
    return () => {
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('keyup', keyup)
      window.removeEventListener('blur', blur)
      document.removeEventListener('mousemove', mousemove)
      document.removeEventListener('mousedown', mousedown)
      el.removeEventListener('pointerdown', pointerdown)
      window.removeEventListener('pointermove', pointermove)
      window.removeEventListener('pointerup', pointerup)
      window.removeEventListener('pointercancel', pointerup)
    }
  }, [gl, camera, scene, raycaster, touch])

  const forward = useMemo(() => new THREE.Vector3(), [])
  const right = useMemo(() => new THREE.Vector3(), [])
  const target = useMemo(() => new THREE.Vector3(), [])
  const center = useMemo(() => new THREE.Vector2(0, 0), [])

  useFrame((_, rawDt) => {
    const st = s.current
    const dt = Math.min(rawDt, 0.05) // a backgrounded tab shouldn't teleport you
    const k = st.keys

    let f = (k.has('f') ? 1 : 0) - (k.has('b') ? 1 : 0) + stick.y
    let r = (k.has('r') ? 1 : 0) - (k.has('l') ? 1 : 0) + stick.x
    const len = Math.hypot(f, r)
    if (len > 1) { f /= len; r /= len }
    if (!active) f = r = 0

    forward.set(-Math.sin(st.yaw), 0, -Math.cos(st.yaw))
    right.set(Math.cos(st.yaw), 0, -Math.sin(st.yaw))
    const speed = k.has('run') ? SPRINT : WALK
    target.copy(forward).multiplyScalar(f * speed).addScaledVector(right, r * speed)
    st.vel.lerp(target, 1 - Math.exp(-12 * dt))

    const lim = ROOM.HALF - RADIUS
    const p = camera.position
    p.x = THREE.MathUtils.clamp(p.x + st.vel.x * dt, -lim, lim)
    p.z = THREE.MathUtils.clamp(p.z + st.vel.z * dt, -lim, lim)

    const v = Math.hypot(st.vel.x, st.vel.z)
    st.bob = v > 0.1 ? st.bob + dt * v * 2.4 : st.bob
    p.y = ROOM.EYE + (reducedMotion ? 0 : Math.sin(st.bob) * 0.03 * Math.min(v / WALK, 1.4))
    camera.rotation.set(st.pitch, st.yaw, 0)

    if (active && !touch) {
      raycaster.setFromCamera(center, camera)
      setHovered(exhibitAt(raycaster, scene))
    }
  })

  return null
}
