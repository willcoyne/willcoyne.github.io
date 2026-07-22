import React, { useState, useEffect } from 'react'

// Venmo username for paid submissions
const venmoUser = '@wil72'

// If you want to use Formspree instead of the backend, set VITE_FORMSPREE_ENDPOINT
const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT || ''

export default function App(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [question, setQuestion] = useState('')
  const [tier, setTier] = useState('free')
  const [amount, setAmount] = useState('')
  const [pinkie, setPinkie] = useState(false)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(()=>{
    setNotice('')
  }, [tier])

  useEffect(()=>{
    // read theme from localStorage
    const t = localStorage.getItem('theme')
    if(t === 'dark'){
      document.documentElement.classList.add('dark')
      setDark(true)
    }
  }, [])

  async function copyVenmo(){
    try{
      await navigator.clipboard.writeText(venmoUser)
      alert(`Copied ${venmoUser} to clipboard. Send your payment via Venmo.`)
    }catch(e){
      alert(`Venmo: ${venmoUser} — copy manually if needed.`)
    }
  }

  async function handleSubmit(){
    if(!question.trim()){ alert('Please enter a question or prompt.'); return }
    if(!email.trim()){ alert('Please enter your email so William can reply.'); return }
    // basic email validation: must contain @ and . after @
    const at = email.indexOf('@')
    const dot = email.lastIndexOf('.')
    if(at < 1 || dot < at + 2){ alert('Please enter a valid email address.'); return }

    if(tier === 'paid'){
      if(!amount || Number(amount) <= 0){ alert('For paid priority, enter the amount you paid.'); return }
      if(!pinkie){ alert('Please pinkie promise that you paid before submitting.'); return }
    }

    setLoading(true)
    setNotice('')
    try{
      const body = { name, email, question, tier, amount: tier==='paid' ? Number(amount) : null }

      if(FORMSPREE_ENDPOINT){
        // Send to Formspree (no backend). Formspree accepts JSON POSTs.
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(body)
        })
        if(res.ok){
          setNotice('Submitted! William will receive your question by email.')
          setName('')
          setEmail('')
          setQuestion('')
          setTier('free')
          setAmount('')
          setPinkie(false)
        }else{
          const err = await res.json().catch(()=>({ error: 'submission failed' }))
          setNotice('Submission failed: ' + (err.error || res.statusText))
        }
      }else{
        // Fallback to local backend
        const res = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
        if(res.status === 201){
          const data = await res.json()
          setNotice('Submitted! Your question id: ' + data.id + '. William will respond by email.')
          // reset form
          setName('')
          setEmail('')
          setQuestion('')
          setTier('free')
          setAmount('')
          setPinkie(false)
        }else{
          const err = await res.json().catch(()=>({ error: 'server error' }))
          setNotice('Submission failed: ' + (err.error || res.statusText))
        }
      }
    }catch(err){
      setNotice('Network error: ' + err.message)
    }finally{
      setLoading(false)
    }
  }

  function toggleTheme(){
    const nowDark = !dark
    setDark(nowDark)
    if(nowDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', nowDark ? 'dark' : 'light')
  }

  return (
    <div className="wrap">
      <div style={{display:'flex',alignItems:'center',gap:12,justifyContent:'space-between'}}>
        <h1>Ask William a Question</h1>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <label style={{fontSize:13}} className="muted">Dark</label>
          <button onClick={toggleTheme} style={{background:dark?"#111":"#eee",color:dark?"#fff":"#111",padding:'6px 10px',borderRadius:8}}>{dark? 'On' : 'Off'}</button>
        </div>
      </div>
      <p className="lead">Submit a question or prompt — William will answer personally. Choose free or pay for priority.</p>

      <div className="form">
        <label>Your name</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Jane Doe" />

        <label>Your email (so William can reply)</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />

        <label>Your question or prompt</label>
        <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Type your question here..." />

        <label>Delivery option</label>
        <div className="row">
          <label className="radio"><input type="radio" checked={tier==='free'} onChange={()=>setTier('free')} /> Ask for free</label>
          <label className="radio"><input type="radio" checked={tier==='paid'} onChange={()=>setTier('paid')} /> Pay for priority</label>
        </div>

        {tier === 'paid' && (
          <div className="paybox">
            <div className="small">To pay, send your Venmo payment to <strong>{venmoUser}</strong>. After paying, pinkie promise you paid and enter the amount you sent. Higher amounts receive higher priority.</div>
            <div style={{marginTop:8}} className="row">
              <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} min="1" step="0.01" placeholder="Amount you paid (e.g. 10.00)" />
            </div>
            <div style={{marginTop:8,display:'flex',gap:12,alignItems:'center'}}>
              <button type="button" onClick={copyVenmo}>Copy Venmo username</button>
              <label style={{fontWeight:400}}><input type="checkbox" checked={pinkie} onChange={e=>setPinkie(e.target.checked)} /> I pinkie promise I paid</label>
            </div>
          </div>
        )}

        <div className="actions" style={{marginTop:14}}>
          <button onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit question'}</button>
          <div className="right muted small">You will receive replies by email when William answers.</div>
        </div>
      </div>

      {notice && <div className="notice">{notice}</div>}

      <footer>
        <div className="small">Submissions are stored on the server; answers are emailed from the admin interface. See the repo `server/` folder for deployment instructions.</div>
      </footer>
    </div>
  )
}
