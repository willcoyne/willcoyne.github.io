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

  useEffect(()=>{
    document.documentElement.classList.add('dark')
  }, [])

  useEffect(()=>{
    setNotice('')
  }, [tier])

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
        // Formspree expects form-encoded fields; send as URLSearchParams
        const params = new URLSearchParams()
        if(name) params.append('name', name)
        params.append('email', email)
        params.append('message', question)
        params.append('tier', tier)
        if(tier === 'paid') params.append('amount', amount)

        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: params
        })
        if(res.ok){
          setNotice('Submitted! Coyne AI will receive your question and William will respond by email.')
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
        const res = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
        if(res.status === 201){
          const data = await res.json()
          setNotice('Submitted! Your question id: ' + data.id + '. William will respond by email.')
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

  return (
    <div className="wrap">
      <header className="hero">
        <div>
          <span className="eyebrow">Live Advice Engine</span>
          <h1>Coyne AI</h1>
          <p className="lead">Ask a living AI for advice on your problems, decisions, and creative ideas. Get thoughtful guidance delivered by William with a futuristic edge.</p>
        </div>
        <div className="status-card">
          <span>Dark mode</span>
          <strong>Enabled</strong>
        </div>
      </header>

      <section className="form-card">
        <label>Your name</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Jane Doe" />

        <label>Your email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />

        <label>Your question or prompt</label>
        <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask Coyne AI anything..." />

        <label>Response priority</label>
        <div className="tier-options" role="group" aria-label="Response priority">
          <button
            type="button"
            className={`tier-option ${tier === 'free' ? 'active' : ''}`}
            onClick={() => setTier('free')}
          >
            <span className="tier-title">Free advice</span>
            <span className="tier-copy">Standard response, no payment required</span>
          </button>
          <button
            type="button"
            className={`tier-option ${tier === 'paid' ? 'active' : ''}`}
            onClick={() => setTier('paid')}
          >
            <span className="tier-title">Priority response</span>
            <span className="tier-copy">Fast-tracked help with paid priority</span>
          </button>
        </div>

        {tier === 'paid' && (
          <div className="paybox">
            <div className="small">Send payment to <strong>{venmoUser}</strong> for priority handling. Enter the amount you paid and confirm with a pinkie promise.</div>
            <div className="row" style={{marginTop:8}}>
              <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} min="1" step="0.01" placeholder="Amount you paid (e.g. 10.00)" />
            </div>
            <div className="pay-actions">
              <button
                type="button"
                className={`pinkie-button ${pinkie ? 'active' : ''}`}
                aria-pressed={pinkie}
                onClick={() => setPinkie(prev => !prev)}
              >
                {pinkie ? '✅ Pinkie promise confirmed' : 'I pinkie promise I paid'}
              </button>
              <button type="button" className="ghost" onClick={copyVenmo}>Copy Venmo username</button>
            </div>
          </div>
        )}

        <div className="actions">
          <button onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Ask Coyne AI'}</button>
          <span className="hint">Replies arrive by email once William reviews your submission.</span>
        </div>
      </section>

      {notice && <div className="notice">{notice}</div>}

      <footer className="footer-note">
        Coyne AI is your gateway to living advice — questions are collected and William answers personally. This interface is built for a sleek, futuristic experience.
      </footer>
    </div>
  )
}
