// Everything hung on the walls. The pause menu lists the same entries, so this
// file is the single place to add a project or change a link.

export const RESUME_URL = '/William-Coyne-Resume.pdf'
export const EMAIL = 'coyne.w@wustl.edu'

// Room interior: x and z run from -HALF to +HALF, floor at y = 0.
export const ROOM = { HALF: 6, HEIGHT: 4.2, EYE: 1.65 }

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

// The back wall, right of the door. `href` is optional; without one a badge
// just shows its label when you look at it.
export const badges = [
  {
    id: 'security-plus', shape: 'hex', color: '#c8102e',
    top: 'CompTIA', big: 'Security+', bottom: 'SY0-701', caption: 'certified · nov 2024',
    label: 'CompTIA Security+ certified (SY0-701), Nov 2024',
    href: 'https://www.linkedin.com/in/will-coyne',
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
    id: 'track', shape: 'shield', color: '#007360',
    top: 'WashU', big: 'T&F', bottom: 'athlete', caption: 'track & field',
    label: 'Collegiate student-athlete, WashU Track & Field',
  },
  {
    id: 'ignatian', shape: 'circle', color: '#4b2e83',
    top: 'Ignatian', big: 'Honors', bottom: 'capstone', caption: 'honors program 2025',
    label: 'Ignatian Honors Program capstone, 2025',
    href: 'https://github.com/willcoyne/Capstone-2025',
  },
]

// Same-origin pages open in this tab; everything else gets a new tab.
export const isExternal = (href) => /^https?:\/\//.test(href)
