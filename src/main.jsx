import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import Admin from './Admin'
import './styles.css'

const pathname = window.location.pathname
const Root = pathname.startsWith('/admin') ? Admin : App

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
