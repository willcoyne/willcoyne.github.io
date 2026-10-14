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

// Same-origin pages open in this tab; everything else gets a new tab.
export const isExternal = (href) => /^https?:\/\//.test(href)
