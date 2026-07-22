const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const xss = require('xss')

// expects pool from req.app.locals.pool

// rate limit submissions: 5 per IP per hour
const submitLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { error: 'Too many submissions from this IP, please try later.' } })

// POST /api/submit
router.post('/submit', submitLimiter, async (req, res) => {
  const pool = req.app.locals.pool
  let { name, email, question, tier, amount } = req.body
  if(!email || !question) return res.status(400).json({ error: 'email and question required' })

  // basic sanitization
  name = name ? xss(String(name)).slice(0,255) : null
  email = xss(String(email)).slice(0,255)
  question = xss(String(question)).slice(0,5000)
  tier = tier === 'paid' ? 'paid' : 'free'
  amount = amount ? Number(amount) : null

  try{
    const [result] = await pool.query(
      `INSERT INTO questions (name, email, question, tier, amount, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'submitted', NOW())`,
      [name || null, email, question, tier || 'free', amount || null]
    )
    res.status(201).json({ id: result.insertId })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'db error' })
  }
})

// middleware: check admin key
function requireAdmin(req, res, next){
  const key = req.headers['x-api-key'] || req.query.api_key
  if(!key || key !== process.env.ADMIN_API_KEY) return res.status(401).json({ error: 'unauthorized' })
  next()
}

// GET /api/questions - admin
router.get('/questions', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool
  try{
    const [rows] = await pool.query(`SELECT * FROM questions ORDER BY created_at DESC LIMIT 100`)
    res.json(rows)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'db error' })
  }
})

// POST /api/questions/:id/answer - admin
router.post('/questions/:id/answer', requireAdmin, async (req, res) => {
  const pool = req.app.locals.pool
  const id = Number(req.params.id)
  let { answer } = req.body
  if(!answer) return res.status(400).json({ error: 'answer required' })
  // sanitize/limit answer
  answer = xss(String(answer)).slice(0, 5000)
  try{
    // fetch question
    const [rows] = await pool.query(`SELECT * FROM questions WHERE id = ?`, [id])
    if(!rows.length) return res.status(404).json({ error: 'not found' })
    const q = rows[0]

    // send email via app.locals.mailer
    const mailer = req.app.locals.mailer
    if(!mailer) return res.status(500).json({ error: 'mailer not configured' })

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: q.email,
      subject: `Re: your question (id ${q.id})`,
      text: `Hi ${q.name || ''},\n\nThanks for your question. Here is the answer:\n\n${answer}\n\n--\nWilliam`
    }
    await mailer.sendMail(mailOptions)

    // update db
    await pool.query(`UPDATE questions SET answer = ?, status = 'answered', answered_at = NOW() WHERE id = ?`, [answer, id])
    res.json({ success: true })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

module.exports = router
