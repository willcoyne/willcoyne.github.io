// Building blocks shared by the main room and the gallery.
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ROOM } from './content'
import { header } from './textures'

const ACCENT = new THREE.Color('#6d5cff')
const FRAME = new THREE.Color('#2b2e35')
export const WALL_COLOR = '#f1efea'
const CASING = 0.1 // width of the trim around a doorway

// Textures are created once per component and freed when it unmounts.
export function useTexture(make, deps) {
  const tex = useMemo(make, deps)
  useEffect(() => () => tex.dispose(), [tex])
  return tex
}

// A wall is a group whose local +z points into the room and whose local +x is the
// viewer's right when facing it, so exhibits are laid out in wall coordinates.
// `at` is [position, y rotation]. `opening` ({ x, w, h }) cuts a doorway out of it.
export function Wall({ at, width = ROOM.HALF * 2, height = ROOM.HEIGHT, color = WALL_COLOR, trim = '#d8d4cc', opening, children }) {
  const [position, ry] = at
  const o = opening
  // [x0, x1, y0, y1] pieces of wall around the opening
  const pieces = o
    ? [[-width / 2, o.x - o.w / 2, 0, height], [o.x + o.w / 2, width / 2, 0, height], [o.x - o.w / 2, o.x + o.w / 2, o.h, height]]
    : [[-width / 2, width / 2, 0, height]]
  const trimMat = <meshStandardMaterial color={trim} roughness={0.9} />

  return (
    <group position={position} rotation={[0, ry, 0]}>
      {pieces.map(([x0, x1, y0, y1]) => (
        <mesh key={`${x0},${y0}`} position={[(x0 + x1) / 2, (y0 + y1) / 2, 0]}>
          <planeGeometry args={[x1 - x0, y1 - y0]} />
          <meshStandardMaterial color={color} roughness={0.95} />
        </mesh>
      ))}
      {pieces.filter((p) => p[2] === 0).map(([x0, x1]) => (
        <mesh key={`b${x0}`} position={[(x0 + x1) / 2, 0.07, 0.015]}>
          <boxGeometry args={[x1 - x0, 0.14, 0.03]} />
          {trimMat}
        </mesh>
      ))}
      {o && (
        <>
          {[o.x - o.w / 2 - CASING / 2, o.x + o.w / 2 + CASING / 2].map((x) => (
            <mesh key={x} position={[x, (o.h + CASING) / 2, 0.02]}>
              <boxGeometry args={[CASING, o.h + CASING, 0.04]} />
              {trimMat}
            </mesh>
          ))}
          <mesh position={[o.x, o.h + CASING / 2, 0.02]}>
            <boxGeometry args={[o.w, CASING, 0.04]} />
            {trimMat}
          </mesh>
        </>
      )}
      {children}
    </group>
  )
}

// A framed picture. Passing `exhibit` makes it clickable and lets it light up on hover.
export function Exhibit({ texture, w, h, position, exhibit, hovered, frame = true }) {
  const group = useRef()
  const frameMat = useRef()
  const on = !!exhibit && hovered === exhibit.id

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-14 * dt)
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, on ? 0.06 : 0, k)
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, on ? 1.04 : 1, k))
    frameMat.current?.color.lerp(on ? ACCENT : FRAME, k)
  })

  return (
    <group position={position}>
      <group ref={group}>
        {frame && (
          <mesh position={[0, 0, 0.025]}>
            <boxGeometry args={[w + 0.08, h + 0.08, 0.05]} />
            <meshStandardMaterial ref={frameMat} color={FRAME} roughness={0.6} />
          </mesh>
        )}
        <mesh position={[0, 0, 0.052]} userData={exhibit ? { exhibit } : undefined}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={texture} transparent={!frame} />
        </mesh>
      </group>
    </group>
  )
}

export function Header({ text, x = 0, y = 3.55, color }) {
  const tex = useTexture(() => header(text, 4, 0.5, color), [text, color])
  return <Exhibit texture={tex} w={4} h={0.5} position={[x, y, 0]} frame={false} />
}
