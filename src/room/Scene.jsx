// The room: four walls, a floor and ceiling, and the exhibits hung on them.
// Spawn faces north (the resume). Projects are on the west wall to your left,
// links on the east wall to your right. Behind you: GrocerEZ, the classic-site door,
// and the badges. A doorway right of the cv leads to the gallery.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DOORWAY, EMAIL, RESUME_URL, ROOM, badges, grocerez, isExternal, links, projects } from './content'
import {
  badge, doorPanel, floorDecal, floorTexture, grocerezCard, linkCard, louvres,
  nameCard, noteCard, plaque, projectCard, resumePlaceholder,
} from './textures'
import { loadResumeTexture } from './resumeTexture'
import { Exhibit, Header, WALL_COLOR, Wall, useTexture } from './parts'
import Gallery from './Gallery'

const H = ROOM.HALF

// [position, y rotation] of each wall; see Wall for its coordinates.
const WALLS = {
  north: [[0, 0, -H], 0],
  west: [[-H, 0, 0], Math.PI / 2],
  east: [[H, 0, 0], -Math.PI / 2],
  south: [[0, 0, H], Math.PI],
}

// Centers n exhibits along a wall, at most 3 units apart.
const spread = (n) => {
  const gap = Math.min(3, (H * 2 - 1) / n)
  return Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * gap)
}

const linkAction = (href, newTab = isExternal(href)) => ({ type: 'link', href, newTab })

function ProjectExhibit({ p, i, x, hovered }) {
  const w = 2.2, hgt = 1.45
  const tex = useTexture(() => projectCard(p, i, w, hgt), [p, i])
  const exhibit = useMemo(() => ({ id: p.id, label: `open ${p.title}`, action: linkAction(p.href) }), [p])
  return <Exhibit texture={tex} w={w} h={hgt} position={[x, 1.75, 0]} exhibit={exhibit} hovered={hovered} />
}

function LinkExhibit({ l, x, hovered }) {
  const w = 2.2, hgt = 1.0
  const tex = useTexture(() => linkCard(l, w, hgt), [l])
  const exhibit = useMemo(() => ({ id: l.id, label: `open ${l.title}`, action: linkAction(l.href) }), [l])
  return <Exhibit texture={tex} w={w} h={hgt} position={[x, 1.7, 0]} exhibit={exhibit} hovered={hovered} />
}

function Plaque({ id, label, text, action, position, hovered, w = 1.05, h = 0.3 }) {
  const tex = useTexture(() => plaque(text, w, h), [text, w, h])
  const exhibit = useMemo(() => ({ id, label, action }), [id, label, action])
  return <Exhibit texture={tex} w={w} h={h} position={position} exhibit={exhibit} hovered={hovered} />
}

// Shows a placeholder until pdf.js has rendered the real first page.
function Resume({ x, hovered }) {
  const w = 1.9
  const placeholder = useTexture(() => resumePlaceholder(w, w / 0.773, 'loading…'), [])
  const [page, setPage] = useState(null)
  const [failed, setFailed] = useState(false)
  const fallback = useTexture(() => resumePlaceholder(w, w / 0.773, 'click to view'), [])

  useEffect(() => {
    let alive = true
    loadResumeTexture(RESUME_URL)
      .then((r) => { if (alive) setPage(r); else r.texture.dispose() })
      .catch((err) => { console.warn('resume preview failed', err); if (alive) setFailed(true) })
    return () => { alive = false }
  }, [])
  useEffect(() => () => page?.texture.dispose(), [page])

  const h = w / (page?.aspect ?? 0.773)
  const exhibit = useMemo(() => ({ id: 'resume', label: 'read resume', action: { type: 'resume' } }), [])
  return (
    <Exhibit
      texture={page?.texture ?? (failed ? fallback : placeholder)}
      w={w} h={h} position={[x, 1.95, 0]}
      exhibit={exhibit} hovered={hovered}
    />
  )
}

function Door({ hovered }) {
  const tex = useTexture(() => doorPanel(1.1, 2.2), [])
  const exhibit = useMemo(() => ({ id: 'classic', label: 'go to the classic site', action: linkAction('/classic/') }), [])
  return (
    <group>
      <mesh position={[0, 1.15, 0.03]}>
        <boxGeometry args={[1.34, 2.36, 0.06]} />
        <meshStandardMaterial color="#d8d4cc" roughness={0.8} />
      </mesh>
      <Exhibit texture={tex} w={1.1} h={2.2} position={[0, 1.1, 0.02]} exhibit={exhibit} hovered={hovered} frame={false} />
      <Plaque id="classic-sign" label="go to the classic site" text="classic site →" action={exhibit.action} position={[0, 2.68, 0]} w={1.5} h={0.34} hovered={hovered} />
    </group>
  )
}

function GrocerezPanel({ x, exhibit, hovered }) {
  const w = 2.7, h = 1.9
  const tex = useTexture(() => grocerezCard(grocerez, w, h), [])
  return <Exhibit texture={tex} w={w} h={h} position={[x, 1.9, 0]} exhibit={exhibit} hovered={hovered} />
}

// A little wall-mounted pantry, after GrocerEZ's own 3D pantry home screen.
// The louvred doors swing wider when you look at it.
const CAN_COLORS = ['#e4572e', '#f3a712', '#29335c', '#669bbc', '#a8c686', '#db5461', '#ffd166', '#5c946e']
function PantryCabinet({ x, exhibit, hovered }) {
  const W = 1.0, Hc = 1.4, D = 0.32, T = 0.04
  const louvre = useTexture(louvres, [])
  const left = useRef()
  const right = useRef()
  const on = hovered === exhibit.id
  const items = useMemo(() => {
    const out = []
    let n = 0
    for (const y of [0.08, 0.5, 0.92]) {
      for (let xi = -0.36; xi < 0.36; ) {
        const iw = 0.1 + ((n * 37) % 7) / 70
        const ih = 0.16 + ((n * 53) % 9) / 60
        out.push({ x: xi + iw / 2, y: y + ih / 2, w: iw, h: ih, c: CAN_COLORS[n % CAN_COLORS.length] })
        xi += iw + 0.03
        n++
      }
    }
    return out
  }, [])

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-8 * dt)
    const a = on ? 2.0 : 1.2
    left.current.rotation.y = THREE.MathUtils.lerp(left.current.rotation.y, -a, k)
    right.current.rotation.y = THREE.MathUtils.lerp(right.current.rotation.y, a, k)
  })

  const wood = <meshStandardMaterial color="#b07a45" roughness={0.8} />
  return (
    <group position={[x, 1.05, 0]} userData={{ exhibit }}>
      {/* back, sides, top, bottom */}
      <mesh position={[0, Hc / 2, T / 2]}><boxGeometry args={[W, Hc, T]} /><meshStandardMaterial color="#8a5a30" roughness={0.9} /></mesh>
      <mesh position={[-W / 2 + T / 2, Hc / 2, D / 2]}><boxGeometry args={[T, Hc, D]} />{wood}</mesh>
      <mesh position={[W / 2 - T / 2, Hc / 2, D / 2]}><boxGeometry args={[T, Hc, D]} />{wood}</mesh>
      <mesh position={[0, Hc - T / 2, D / 2]}><boxGeometry args={[W, T, D]} />{wood}</mesh>
      {[0, 0.46, 0.88].map((y) => (
        <mesh key={y} position={[0, y + T / 2, D / 2]}><boxGeometry args={[W - T * 2, T, D]} />{wood}</mesh>
      ))}
      {items.map((it, i) => (
        <mesh key={i} position={[it.x, it.y, D * 0.45]}>
          <boxGeometry args={[it.w, it.h, 0.12]} />
          <meshStandardMaterial color={it.c} roughness={0.6} />
        </mesh>
      ))}
      {/* doors hinge on the outer edges */}
      <group ref={left} position={[-W / 2, Hc / 2, D]} rotation={[0, -1.2, 0]}>
        <mesh position={[W / 4, 0, 0]}><boxGeometry args={[W / 2, Hc, 0.03]} /><meshStandardMaterial map={louvre} roughness={0.8} /></mesh>
      </group>
      <group ref={right} position={[W / 2, Hc / 2, D]} rotation={[0, 1.2, 0]}>
        <mesh position={[-W / 4, 0, 0]}><boxGeometry args={[W / 2, Hc, 0.03]} /><meshStandardMaterial map={louvre} roughness={0.8} /></mesh>
      </group>
    </group>
  )
}

function Grocerez({ hovered }) {
  const exhibit = useMemo(() => ({ id: 'grocerez', label: 'open GrocerEZ', action: linkAction(grocerez.href) }), [])
  return (
    <>
      <Header text="grocerez" x={-3.4} />
      <PantryCabinet x={-4.95} exhibit={exhibit} hovered={hovered} />
      <GrocerezPanel x={-2.7} exhibit={exhibit} hovered={hovered} />
    </>
  )
}

function Badge({ b, w, position, hovered }) {
  const h = w * 1.2
  const tex = useTexture(() => badge(b, w, h), [b, w, h])
  const exhibit = useMemo(() => ({ id: b.id, label: b.label, action: b.href ? linkAction(b.href) : null }), [b])
  return <Exhibit texture={tex} w={w} h={h} position={position} exhibit={exhibit} hovered={hovered} frame={false} />
}

// Two rows of badges between the door and the corner; they shrink a little
// when a row gets crowded.
function Badges({ hovered }) {
  const cols = Math.max(1, Math.ceil(badges.length / 2))
  const gap = Math.min(1.4, 5 / cols)
  const w = Math.min(0.95, gap - 0.08)
  const x0 = 3.45 - ((cols - 1) * gap) / 2
  return (
    <>
      <Header text="badges" x={3.45} />
      {badges.map((b, i) => (
        <Badge
          key={b.id} b={b} w={w} hovered={hovered}
          position={[x0 + (i % cols) * gap + (i >= cols && badges.length % 2 ? gap / 2 : 0), i < cols ? 2.55 : 1.3, 0]}
        />
      ))}
    </>
  )
}

function Shell({ touch }) {
  const floor = useTexture(() => {
    const t = floorTexture()
    t.repeat.set(H, H) // 2 x 2 unit tiles
    return t
  }, [])
  const decal = useTexture(() => floorDecal(touch, 2.6, 1), [touch])

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[H * 2, H * 2]} />
        <meshStandardMaterial map={floor} roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, -1.7]}>
        <planeGeometry args={[2.6, 1]} />
        <meshBasicMaterial map={decal} transparent depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.HEIGHT, 0]}>
        <planeGeometry args={[H * 2, H * 2]} />
        <meshBasicMaterial color="#e4e2dc" />
      </mesh>
      {/* ceiling light panels */}
      {[-3, 0, 3].map((z) => (
        <mesh key={z} rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.HEIGHT - 0.01, z]}>
          <planeGeometry args={[5, 0.5]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </>
  )
}

export default function Scene({ hovered, touch }) {
  const resumeOpen = useMemo(() => linkAction(RESUME_URL, true), [])
  const name = useTexture(() => nameCard(EMAIL, 2.3, 1.5), [])
  const cv = useTexture(() => noteCard('cv', 'coming soon!', 1.6, 1.0), [])
  const projectSpots = spread(projects.length)
  const linkSpots = spread(links.length)

  return (
    <>
      <color attach="background" args={[WALL_COLOR]} />
      <hemisphereLight args={['#ffffff', '#cfcac0', 1.6]} />
      <pointLight position={[0, ROOM.HEIGHT - 0.4, 0]} intensity={14} distance={0} decay={1.2} />

      <Shell touch={touch} />

      <Wall at={WALLS.north} opening={DOORWAY}>
        <Header text="resume" />
        <Exhibit texture={name} w={2.3} h={1.5} position={[-3.6, 1.85, 0]} />
        <Resume x={-0.6} hovered={hovered} />
        <Plaque
          id="resume-download" label="download resume pdf" text="↓ download pdf"
          action={{ type: 'download' }} position={[1.0, 2.15, 0]} hovered={hovered}
        />
        <Plaque
          id="resume-tab" label="open resume in a new tab" text="↗ open in tab"
          action={resumeOpen} position={[1.0, 1.71, 0]} hovered={hovered}
        />
        <Exhibit texture={cv} w={1.6} h={1.0} position={[2.6, 1.85, 0]} />
        <Plaque
          id="gallery-sign" label="the gallery: walk on through" text="gallery ↑"
          action={null} position={[DOORWAY.x, DOORWAY.h + 0.38, 0]} w={1.3} h={0.32} hovered={hovered}
        />
      </Wall>

      <Wall at={WALLS.west}>
        <Header text="projects" />
        {projects.map((p, i) => (
          <ProjectExhibit key={p.id} p={p} i={i} x={projectSpots[i]} hovered={hovered} />
        ))}
      </Wall>

      <Wall at={WALLS.east}>
        <Header text="links" />
        {links.map((l, i) => (
          <LinkExhibit key={l.id} l={l} x={linkSpots[i]} hovered={hovered} />
        ))}
      </Wall>

      <Wall at={WALLS.south}>
        <Grocerez hovered={hovered} />
        <Door hovered={hovered} />
        <Badges hovered={hovered} />
      </Wall>

      <Gallery hovered={hovered} />
    </>
  )
}
