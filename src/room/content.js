// Everything hung on the walls. The pause menu lists the same entries, so this
// file is the single place to add a project or change a link.

export const RESUME_URL = '/William-Coyne-Resume.pdf'
export const EMAIL = 'coyne.w@wustl.edu'

// Room interior: x and z run from -HALF to +HALF, floor at y = 0.
export const ROOM = { HALF: 6, HEIGHT: 4.2, EYE: 1.65 }

// The gallery is through a doorway in the resume wall, right of the cv. Its walls
// are DOORWAY.depth thick; GALLERY_ROOM.x/z is the middle of its floor.
export const DOORWAY = { x: 4.7, w: 1.8, h: 2.7, depth: 0.2 }
const GALLERY_DEPTH = 8
export const GALLERY_ROOM = {
  x: DOORWAY.x, z: -ROOM.HALF - DOORWAY.depth - GALLERY_DEPTH / 2, W: 10, D: GALLERY_DEPTH, HEIGHT: 3.6,
}

// The gallery's photos and videos, in public/gallery/. They fill the frames in order
// (SLOTS in Gallery.jsx), starting with the big one in the middle of the far wall.
// `src` opens when you click; `thumb` is the smaller copy hung on the wall (for a
// video, its poster). Frames left over say "coming soon".
const photo = (id, title, caption) => ({ id, title, caption, src: `/gallery/${id}.jpg`, thumb: `/gallery/${id}-wall.jpg` })
export const gallery = [
  { id: 'pole-vault', video: true, src: '/gallery/pole-vault.mp4', thumb: '/gallery/pole-vault-poster.jpg', title: 'pole vault', caption: 'spring 2026' },
  photo('team-photo', 'team photo', 'march 2025'),
  photo('hackmidwest-selfie', 'hackmidwest', 'oct 2026, building GrocerEZ'),
  photo('the-carry', 'the carry'),
  photo('arms-crossed', 'arms crossed'),
  photo('roof-work', 'roof work', 'june 2026'),
  photo('roof-crew', 'roof crew', 'june 2026'),
  photo('metal-roof', 'metal roof', 'june 2026'),
  photo('grocerez-sketch-closed', 'grocerez sketch', 'the pantry, closed'),
  photo('grocerez-sketch-open', 'grocerez sketch', 'the pantry, open'),
]

export const projects = [
  {
    id: 'job-saver',
    title: 'job saver',
    blurb: 'chrome extension: one click saves a job posting to a spreadsheet',
    href: 'https://github.com/willcoyne/job-saver-extension',
    host: 'github.com/willcoyne/job-saver-extension',
    pinned: true,
  },
  {
    id: 'coyne-ai',
    title: 'coyne ai',
    blurb: 'ask a living ai for advice',
    href: '/coyne-ai/',
    host: 'willcoyne.us/coyne-ai',
  },
  {
    id: 'phnordle',
    title: 'phnordle',
    blurb: 'word game',
    href: '/phnordle/',
    host: 'willcoyne.us/phnordle',
  },
  {
    id: 'sigma-chi',
    title: 'sigma chi',
    blurb: 'designed and built',
    href: 'https://washusigmachi.org',
    host: 'washusigmachi.org',
  },
]

export const links = [
  { id: 'linkedin', title: 'linkedin', handle: 'in/will-coyne', mark: 'in', color: '#0a66c2', href: 'https://www.linkedin.com/in/will-coyne' },
  { id: 'github', title: 'github', handle: '@willcoyne', mark: 'gh', color: '#1f2328', href: 'https://github.com/willcoyne' },
  { id: 'instagram', title: 'instagram', handle: '@willycoyne', mark: 'ig', color: '#d62976', href: 'https://www.instagram.com/willycoyne' },
  { id: 'email', title: 'email', handle: EMAIL, mark: '@', color: '#3a7d5c', href: `mailto:${EMAIL}` },
]

// The back wall, left of the door.
export const grocerez = {
  id: 'grocerez',
  title: 'GrocerEZ',
  kicker: 'HACKMIDWEST 2026 → REAL PRODUCT',
  tagline: 'a shared grocery app for households',
  points: [
    'the shopping list writes itself: wants − pantry',
    'an AI agent plans meals around allergies + diets',
    'a 3D pantry you can walk up to',
    'grocery price estimates by ZIP code',
  ],
  status: 'built at HackMidwest 2026, now becoming a real product',
  href: 'https://github.com/willcoyne/grocerez',
  host: 'github.com/willcoyne/grocerez',
}

// The back wall, right of the door, in two rows; the first half goes on top.
// `href` is optional; without one a badge just shows its label when you look at it.
export const badges = [
  {
    id: 'security-plus', shape: 'hex', color: '#c8102e',
    top: 'CompTIA', big: 'Security+', bottom: 'SY0-701', caption: 'certified · nov 2024',
    label: 'CompTIA Security+ certified (SY0-701), Nov 2024',
    href: 'https://www.credly.com/badges/a37a2143-a249-4741-b56c-e9658b4a88ea/linked_in_profile',
  },
  {
    id: 'hackmidwest', shape: 'circle', color: '#f26b21',
    top: 'HackMidwest', big: '2026', bottom: 'hacker', caption: 'built GrocerEZ',
    label: 'HackMidwest 2026: built GrocerEZ',
    href: grocerez.href,
  },
  {
    id: 'deans-list', shape: 'circle', color: '#a51417',
    top: "Dean's List", big: 'WashU', bottom: 'fall 2025', caption: "dean's list",
    label: "Dean's List, WashU, Fall 2025",
  },
  {
    id: 'ap-scholar', shape: 'hex', color: '#0077c8',
    top: 'College Board', big: 'AP', bottom: 'scholar', caption: 'with distinction 2025',
    label: 'AP Scholar with Distinction, College Board, 2025',
  },
  {
    id: 'loker-medal', shape: 'circle', color: '#a67c00',
    top: 'Dr. Ford', big: 'Loker', bottom: 'medal', caption: 'loyola blakefield 2025',
    label: 'Doctor Ford Loker Medal, Loyola Blakefield 2025: varsity letter + academic excellence',
  },
  {
    id: 'ustfccca', shape: 'shield', color: '#007360',
    top: 'USTFCCCA', big: 'T&F', bottom: 'WashU', caption: 'all-academic 2026',
    label: 'USTFCCCA All-Academic, WashU Track & Field, 2026',
    href: 'https://washubears.com/news/2026/7/21/mens-track-and-field-mens-track-and-field-named-ustfccca-all-academic-18-bears-earn-individual-honors.aspx',
  },
  {
    id: 'all-state', shape: 'shield', color: '#1d3557',
    top: 'Maryland', big: 'All-State', bottom: '1st team', caption: 'all-state t&f 2025',
    label: 'Maryland All-State Track & Field 2025: Boys First Team + All-Senior Team',
    href: 'https://md.milesplit.com/articles/379017/2025-maryland-all-state-tf-honors-boys-first-team',
  },
  {
    id: 'all-metro', shape: 'circle', color: '#2b2d42',
    top: 'Baltimore Sun', big: 'All-Metro', bottom: '1st team', caption: 'pole vault 2024–25',
    label: 'Baltimore Sun All-Metro, pole vault: 1st team indoor 2024–25, 2nd team outdoor 2024',
    href: 'https://www.baltimoresun.com/2025/04/10/all-metro-boys-indoor-track-and-field/',
  },
  {
    id: 'all-miaa', shape: 'hex', color: '#4b2e83',
    top: 'Track & Field', big: 'All-MIAA', bottom: '2024 + 2025', caption: 'indoor + outdoor',
    label: 'All-MIAA Track & Field, indoor and outdoor, 2024 and 2025',
    href: 'https://miaasports.net/2025_All-MIAA_Track_-_Field',
  },
]

// Same-origin pages open in this tab; everything else gets a new tab.
export const isExternal = (href) => /^https?:\/\//.test(href)
