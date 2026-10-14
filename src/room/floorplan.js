// Where you can stand. The floor is a few rectangles in world x/z (the main room,
// the gallery and the doorway between them) minus the gallery furniture.
import { DOORWAY, GALLERY_ROOM as G, ROOM } from './content'

export const RADIUS = 0.45 // how close you can get to a wall
const JAMB = 0.3 // ...and to a door jamb, so the doorway isn't fiddly to line up with
const AROUND = 0.3 // ...and to furniture

// Furniture footprints in gallery coordinates (origin mid-floor, -z toward the far
// wall). Gallery.jsx builds each piece on its footprint.
export const FURNITURE = {
  bench: { x: 0, z: 0, w: 2.2, d: 0.55 },
  plinth: { x: -3.35, z: 0, w: 0.5, d: 0.5 },
  plantWest: { x: -4.4, z: -3.4, w: 0.6, d: 0.6 },
  plantEast: { x: 4.4, z: -3.4, w: 0.6, d: 0.6 },
  lounge: { x: 3.35, z: 3.3, w: 2.7, d: 1.1 }, // two armchairs, a side table and a lamp
}

const H = ROOM.HALF
const box = (x0, z0, x1, z1) => ({ x0, z0, x1, z1 })
const inside = (b, x, z) => x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1

const floors = [
  box(-H + RADIUS, -H + RADIUS, H - RADIUS, H - RADIUS),
  box(G.x - G.W / 2 + RADIUS, G.z - G.D / 2 + RADIUS, G.x + G.W / 2 - RADIUS, G.z + G.D / 2 - RADIUS),
  // overlaps both rooms a little so you can't get stuck on the seam
  box(DOORWAY.x - DOORWAY.w / 2 + JAMB, G.z + G.D / 2 - RADIUS - 0.01, DOORWAY.x + DOORWAY.w / 2 - JAMB, -H + RADIUS + 0.01),
]

const furniture = Object.values(FURNITURE).map((f) => box(
  G.x + f.x - f.w / 2 - AROUND, G.z + f.z - f.d / 2 - AROUND,
  G.x + f.x + f.w / 2 + AROUND, G.z + f.z + f.d / 2 + AROUND,
))

export const canStand = (x, z) => floors.some((b) => inside(b, x, z)) && !furniture.some((b) => inside(b, x, z))
