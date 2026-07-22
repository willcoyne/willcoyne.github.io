import React, { useState } from 'react'

export default function Admin(){
  const [apiKey, setApiKey] = useState('')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function fetchQuestions(){
    setErr('')
    setLoading(true)
    try{
      const res = await fetch('/api/questions', { headers: { 'x-api-key': apiKey } })
      if(!res.ok){ const e = await res.json().catch(()=>({error:res.statusText})); setErr(e.error||res.statusText); setQuestions([]); return }
      const data = await res.json()
      setQuestions(data)
    }catch(e){ setErr(e.message) }
    setLoading(false)
  }

  async function answer(id, text){
    try{
      const res = await fetch(`/api/questions/${id}/answer`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ answer: text })
      })
      if(!res.ok){ const e = await res.json().catch(()=>({error:res.statusText})); alert('Error: '+(e.error||res.statusText)); return }
      alert('Answered and emailed.')
      fetchQuestions()
    }catch(e){ alert('Network: '+e.message) }
  }

  return (
    <div className="wrap">
      <h1>Admin</h1>
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <input placeholder="ADMIN API KEY" value={apiKey} onChange={e=>setApiKey(e.target.value)} />
        <button onClick={fetchQuestions} disabled={loading}>{loading? 'Loading...':'Load submissions'}</button>
      </div>
      {err && <div className="notice">{err}</div>}

      {questions.map(q=> (
        <div key={q.id} style={{border:'1px solid rgba(0,0,0,0.06)',padding:12,borderRadius:8,marginBottom:8}}>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <div><strong>#{q.id}</strong> {q.name} — <span className="muted">{q.email}</span></div>
            <div className="muted">{new Date(q.created_at).toLocaleString()}</div>
          </div>
          <div style={{marginTop:8,whiteSpace:'pre-wrap'}}>{q.question}</div>
          <div style={{marginTop:8}} className="small">Tier: {q.tier} {q.amount ? `— $${q.amount}` : ''} — Status: {q.status}</div>
          {q.status !== 'answered' ? (
            <div style={{marginTop:8}}>
              <textarea id={`ans-${q.id}`} placeholder="Type your answer here" style={{width:'100%',minHeight:80}} />
              <div style={{marginTop:8,display:'flex',gap:8}}>
                <button onClick={()=>{ const t = document.getElementById(`ans-${q.id}`).value; if(!t) return alert('Enter an answer'); answer(q.id,t)}}>Send answer</button>
              </div>
            </div>
          ) : (
            <div style={{marginTop:8}} className="small">Answered at: {q.answered_at ? new Date(q.answered_at).toLocaleString() : 'unknown'}</div>
          )}
        </div>
      ))}
    </div>
  )
}
