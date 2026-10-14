// The room: four walls, a floor and ceiling, and the exhibits hung on them.
// Spawn faces north (the resume). Projects are on the west wall to your left,
// links on the east wall to your right, and the classic-site door is behind you.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EMAIL, RESUME_URL, ROOM, isExternal, links, projects } from './content'
import {
  doorPanel, floorDecal, floorTexture, header, linkCard, nameCard,
  noteCard, plaque, projectCard, resumePlaceholder,
} from './textures'
import { loadResumeTexture } from './resumeTexture'

const H = ROOM.HALF
const ACCENT = new THREE.Color('#6d5cff')
const FRAME = new THREE.Color('#2b2e35')
const WALL_COLOR = '#f1efea'

// Each wall is a group whose local +z points into the room and whose local +x is
// the viewer's right when facing it, so exhibits are laid out in wall coordinates.
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

// Textures are created once per component and freed when it unmounts.
function useTexture(make, deps) {
  const tex = useMemo(make, deps)
  useEffect(() => () => tex.dispose(), [tex])
  return tex
}

function Wall({ side, children }) {
  const [position, ry] = WALLS[side]
  return (
    <group position={position} rotation={[0, ry, 0]}>
      <mesh position={[0, ROOM.HEIGHT / 2, 0]}>
        <planeGeometry args={[H * 2, ROOM.HEIGHT]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.07, 0.015]}>
        <boxGeometry args={[H * 2, 0.14, 0.03]} />
        <meshStandardMaterial color="#d8d4cc" roughness={0.9} />
      </mesh>
      {children}
    </group>
  )
}

// A framed picture. Passing `exhibit` makes it clickable and lets it light up on hover.
function Exhibit({ texture, w, h, position, exhibit, hovered, frame = true }) {
  const group = useRef()
  const frameMat = useRef()
  const on = !!exhibit && hovered === exhibit.id

  useFrame((_, dt) => {
    const k = 1 - Math.exp(-14 * dt)
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, on ? 0.06 : 0, k)
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

function Header({ text, y = 3.55 }) {
  const tex = useTexture(() => header(text, 4, 0.5), [text])
  return <Exhibit texture={tex} w={4} h={0.5} position={[0, y, 0]} frame={false} />
}

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
  const cv = useTexture(() => noteCard('cv', 'coming soon!', 1.9, 1.15), [])
  const projectSpots = spread(projects.length)
  const linkSpots = spread(links.length)

  return (
    <>
      <color attach="background" args={['#f1efea']} />
      <hemisphereLight args={['#ffffff', '#cfcac0', 1.6]} />
      <pointLight position={[0, ROOM.HEIGHT - 0.4, 0]} intensity={14} distance={0} decay={1.2} />

      <Shell touch={touch} />

      <Wall side="north">
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
        <Exhibit texture={cv} w={1.9} h={1.15} position={[3.6, 1.85, 0]} />
      </Wall>

      <Wall side="west">
        <Header text="projects" />
        {projects.map((p, i) => (
          <ProjectExhibit key={p.id} p={p} i={i} x={projectSpots[i]} hovered={hovered} />
        ))}
      </Wall>

      <Wall side="east">
        <Header text="links" />
        {links.map((l, i) => (
          <LinkExhibit key={l.id} l={l} x={linkSpots[i]} hovered={hovered} />
        ))}
      </Wall>

      <Wall side="south">
        <Door hovered={hovered} />
      </Wall>
    </>
  )
}
