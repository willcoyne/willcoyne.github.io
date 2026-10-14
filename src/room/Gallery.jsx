// The gallery: a smaller room through the doorway in the resume wall. Photos from
// `gallery` in content.js hang in the frames; the furniture sits on the footprints
// in floorplan.js, so you walk around it.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DOORWAY, GALLERY_ROOM as G, gallery } from './content'
import { FURNITURE } from './floorplan'
import { Exhibit, Header, Wall, useTexture } from './parts'
import { artwork, lightPool, placeholderArt, rug, woodFloor } from './textures'

const WALL_COLOR = '#3f574c'
const WALNUT = '#3a2a1f'
const LINING = '#d8d4cc'
const RUG = { w: 5.2, d: 3.4 }
const MAT = 0.12 // white border round each photo

// [position, y rotation] of each wall in gallery coordinates; see Wall.
const WALLS = {
  north: [[0, 0, -G.D / 2], 0],
  south: [[0, 0, G.D / 2], Math.PI],
  west: [[-G.W / 2, 0, 0], Math.PI / 2],
  east: [[G.W / 2, 0, 0], -Math.PI / 2],
}
const DOOR_X = DOORWAY.x - G.x

// The frames, filled with photos in this order: [wall, x, y, max width, max height]
// in wall coordinates. Photos beyond the last frame only show up in the menu.
const SLOTS = [
  ['north', 0, 1.8, 2.6, 1.6],
  ['north', -3.05, 1.8, 1.5, 1.3],
  ['north', 3.05, 1.8, 1.5, 1.3],
  ['west', -1.7, 1.8, 1.6, 1.3],
  ['west', 1.7, 1.8, 1.6, 1.3],
  ['east', -1.7, 1.8, 1.6, 1.3],
  ['east', 1.7, 1.8, 1.6, 1.3],
  ['south', -3.05, 1.85, 1.5, 1.1],
  ['south', 3.05, 1.85, 1.5, 1.1],
]

// A photo in a mat, as large as its shape allows within the slot. Until it loads,
// or if there's no photo for this frame yet, it shows a placeholder.
function Art({ slot, i, item, pool, hovered }) {
  const [, x, y, maxW, maxH] = slot
  const [photo, setPhoto] = useState(null)
  const empty = useTexture(
    () => placeholderArt(maxW, maxH, MAT, i, item?.src ? 'loading…' : 'photo coming soon'),
    [maxW, maxH, i, item],
  )

  useEffect(() => {
    if (!item?.src) return
    let alive = true
    const img = new Image()
    img.src = item.src
    img.decode()
      .then(() => {
        if (!alive) return
        const aspect = img.naturalWidth / img.naturalHeight
        const iw = Math.min(maxW - MAT * 2, (maxH - MAT * 2) * aspect)
        const w = iw + MAT * 2, h = iw / aspect + MAT * 2
        setPhoto({ texture: artwork(img, w, h, MAT), w, h })
      })
      .catch((err) => console.warn('gallery photo failed to load', item.src, err))
    return () => { alive = false }
  }, [item, maxW, maxH])
  useEffect(() => () => photo?.texture.dispose(), [photo])

  const exhibit = useMemo(() => (item?.src
    ? { id: `art-${i}`, label: `view ${item.title ?? 'photo'}`, action: { type: 'photo', item } }
    : { id: `art-${i}`, label: 'photo coming soon', action: null }), [item, i])
  const w = photo?.w ?? maxW, h = photo?.h ?? maxH

  return (
    <>
      <mesh position={[x, y + 0.25, 0.004]}>
        <planeGeometry args={[w + 1.4, h + 1.6]} />
        <meshBasicMaterial map={pool} transparent depthWrite={false} />
      </mesh>
      <Exhibit texture={photo?.texture ?? empty} w={w} h={h} position={[x, y, 0]} exhibit={exhibit} hovered={hovered} />
    </>
  )
}

function Bench({ x, z, w, d }) {
  const wood = <meshStandardMaterial color={WALNUT} roughness={0.7} />
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.42, 0]}><boxGeometry args={[w, 0.1, d]} /><meshStandardMaterial color="#8b4a2b" roughness={0.5} /></mesh>
      <mesh position={[0, 0.34, 0]}><boxGeometry args={[w - 0.06, 0.06, d - 0.06]} />{wood}</mesh>
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => (
        <mesh key={`${sx}${sz}`} position={[sx * (w / 2 - 0.12), 0.155, sz * (d / 2 - 0.08)]}>
          <boxGeometry args={[0.06, 0.31, 0.06]} />{wood}
        </mesh>
      )))}
    </group>
  )
}

// A white plinth with a slowly turning brass knot on top.
function Plinth({ x, z, w, d }) {
  const knot = useRef()
  useFrame((_, dt) => { knot.current.rotation.y += dt * 0.35 })
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.5, 0]}><boxGeometry args={[w, 1, d]} /><meshStandardMaterial color="#f3f0e9" roughness={0.8} /></mesh>
      <mesh ref={knot} position={[0, 1.26, 0]}>
        <torusKnotGeometry args={[0.15, 0.045, 120, 14]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.4} roughness={0.35} />
      </mesh>
    </group>
  )
}

const LEAVES = [
  [0, 1.4, 0, 0.3], [0.2, 1.15, 0.08, 0.26], [-0.2, 1.05, -0.06, 0.27], [0.05, 0.88, -0.2, 0.24],
  [-0.1, 1.65, 0.08, 0.22], [0.16, 1.55, -0.12, 0.2], [-0.16, 0.85, 0.18, 0.22],
]
const GREENS = ['#3f7d4a', '#2f6a3c', '#5a9a5c']

function Plant({ x, z }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.26, 0.2, 0.5, 20]} /><meshStandardMaterial color="#b5653d" roughness={0.85} /></mesh>
      <mesh position={[0, 0.495, 0]}><cylinderGeometry args={[0.24, 0.24, 0.02, 20]} /><meshStandardMaterial color="#3b2a1e" /></mesh>
      <mesh position={[0, 0.85, 0]}><cylinderGeometry args={[0.025, 0.035, 0.7, 6]} /><meshStandardMaterial color="#5b4330" /></mesh>
      {LEAVES.map(([lx, ly, lz, r], i) => (
        <mesh key={i} position={[lx, ly, lz]} rotation={[i, i * 2, 0]}>
          <icosahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color={GREENS[i % GREENS.length]} roughness={0.8} flatShading />
        </mesh>
      ))}
    </group>
  )
}

// An armchair facing -z, standing on its own origin.
function Armchair({ x, ry }) {
  const fabric = <meshStandardMaterial color="#c08a2a" roughness={0.95} />
  return (
    <group position={[x, 0, 0]} rotation={[0, ry, 0]}>
      <mesh position={[0, 0.24, 0]}><boxGeometry args={[0.82, 0.22, 0.78]} />{fabric}</mesh>
      <mesh position={[0, 0.41, -0.03]}><boxGeometry args={[0.6, 0.12, 0.62]} /><meshStandardMaterial color="#cf9a3a" roughness={0.95} /></mesh>
      <mesh position={[0, 0.62, 0.31]}><boxGeometry args={[0.82, 0.54, 0.16]} />{fabric}</mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.35, 0.45, 0]}><boxGeometry args={[0.12, 0.2, 0.78]} />{fabric}</mesh>
      ))}
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => (
        <mesh key={`${sx}${sz}`} position={[sx * 0.34, 0.065, sz * 0.3]}>
          <cylinderGeometry args={[0.025, 0.02, 0.13, 8]} /><meshStandardMaterial color={WALNUT} />
        </mesh>
      )))}
    </group>
  )
}

// Two armchairs either side of a little table, and a reading lamp.
function Lounge({ x, z }) {
  const wood = <meshStandardMaterial color={WALNUT} roughness={0.6} />
  const brass = <meshStandardMaterial color="#b08d4a" metalness={0.4} roughness={0.4} />
  return (
    <group position={[x, 0, z]}>
      <Armchair x={-0.85} ry={-0.2} />
      <Armchair x={0.6} ry={0.2} />
      <group position={[-0.12, 0, -0.05]}>
        <mesh position={[0, 0.56, 0]}><cylinderGeometry args={[0.24, 0.24, 0.03, 28]} />{wood}</mesh>
        <mesh position={[0, 0.28, 0]}><cylinderGeometry args={[0.025, 0.025, 0.54, 8]} />{wood}</mesh>
        <mesh position={[0, 0.01, 0]}><cylinderGeometry args={[0.16, 0.16, 0.02, 20]} />{wood}</mesh>
        <mesh position={[0.06, 0.665, 0.04]}><cylinderGeometry args={[0.05, 0.04, 0.18, 14]} /><meshStandardMaterial color="#2f5d62" roughness={0.4} /></mesh>
        <mesh position={[-0.08, 0.59, -0.04]} rotation={[0, 0.4, 0]}><boxGeometry args={[0.17, 0.03, 0.23]} /><meshStandardMaterial color="#8c2f39" /></mesh>
      </group>
      <group position={[1.22, 0, 0.25]}>
        <mesh position={[0, 0.015, 0]}><cylinderGeometry args={[0.15, 0.15, 0.03, 20]} />{brass}</mesh>
        <mesh position={[0, 0.78, 0]}><cylinderGeometry args={[0.012, 0.012, 1.5, 6]} />{brass}</mesh>
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.13, 0.2, 0.3, 24, 1, true]} />
          <meshStandardMaterial color="#f3e7cf" emissive="#ffe2b0" emissiveIntensity={0.55} side={THREE.DoubleSide} />
        </mesh>
        <pointLight position={[0, 1.55, 0]} color="#ffd9a0" intensity={1.5} distance={3.5} decay={1.5} />
      </group>
    </group>
  )
}

// Ceiling rails with spot heads angled at the long walls.
function TrackLights() {
  const black = <meshStandardMaterial color="#1d1f24" roughness={0.5} />
  return [-1, 1].map((side) => (
    <group key={side} position={[0, G.HEIGHT, side * 2.2]}>
      <mesh position={[0, -0.02, 0]}><boxGeometry args={[G.W - 2, 0.03, 0.05]} />{black}</mesh>
      {[-3.05, -1, 1, 3.05].map((x) => (
        <group key={x} position={[x, -0.05, 0]} rotation={[side * -0.75, 0, 0]}>
          <mesh position={[0, -0.09, 0]}><cylinderGeometry args={[0.045, 0.06, 0.18, 14]} />{black}</mesh>
          <mesh position={[0, -0.181, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.05, 14]} />
            <meshBasicMaterial color="#fff6e0" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  ))
}

// The short passage through the wall between the two rooms.
function Doorway() {
  const z = G.D / 2 + DOORWAY.depth / 2
  const lining = <meshStandardMaterial color={LINING} roughness={0.9} />
  return (
    <group position={[DOOR_X, 0, z]}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (DOORWAY.w / 2 - 0.02), DOORWAY.h / 2, 0]}>
          <boxGeometry args={[0.04, DOORWAY.h, DOORWAY.depth]} />{lining}
        </mesh>
      ))}
      <mesh position={[0, DOORWAY.h - 0.02, 0]}><boxGeometry args={[DOORWAY.w, 0.04, DOORWAY.depth]} />{lining}</mesh>
      <mesh position={[0, 0.005, 0]}><boxGeometry args={[DOORWAY.w, 0.01, DOORWAY.depth]} /><meshStandardMaterial color={WALNUT} /></mesh>
    </group>
  )
}

export default function Gallery({ hovered }) {
  const floor = useTexture(() => {
    const t = woodFloor()
    t.repeat.set(G.W / 2, G.D / 2)
    return t
  }, [])
  const carpet = useTexture(() => rug(RUG.w, RUG.d), [])
  const pool = useTexture(lightPool, [])
  const width = (side) => (side === 'north' || side === 'south' ? G.W : G.D)

  return (
    <group position={[G.x, 0, G.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[G.W, G.D]} />
        <meshStandardMaterial map={floor} roughness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[RUG.w, RUG.d]} />
        <meshStandardMaterial map={carpet} roughness={1} transparent alphaTest={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, G.HEIGHT, 0]}>
        <planeGeometry args={[G.W, G.D]} />
        <meshBasicMaterial color="#e6e2d9" />
      </mesh>
      <pointLight position={[0, G.HEIGHT - 0.5, 0]} intensity={9} distance={12} decay={1.2} />
      <TrackLights />
      <Doorway />

      {Object.entries(WALLS).map(([side, at]) => (
        <Wall
          key={side} at={at} width={width(side)} height={G.HEIGHT} color={WALL_COLOR} trim={WALNUT}
          opening={side === 'south' ? { x: -DOOR_X, w: DOORWAY.w, h: DOORWAY.h } : undefined}
        >
          {side === 'north' && <Header text="gallery" y={G.HEIGHT - 0.45} color="rgba(240,233,218,0.85)" />}
          {SLOTS.map((slot, i) => slot[0] === side && (
            <Art key={i} slot={slot} i={i} item={gallery[i]} pool={pool} hovered={hovered} />
          ))}
        </Wall>
      ))}

      <Bench {...FURNITURE.bench} />
      <Plinth {...FURNITURE.plinth} />
      <Plant {...FURNITURE.plantWest} />
      <Plant {...FURNITURE.plantEast} />
      <Lounge {...FURNITURE.lounge} />
    </group>
  )
}
