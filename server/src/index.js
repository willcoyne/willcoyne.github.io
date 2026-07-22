require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { initPool } = require('./db')
const routes = require('./routes')
const nodemailer = require('nodemailer')

const PORT = process.env.PORT || 4000

async function main(){
  const app = express()
  app.use(express.json())

  // CORS
  const origin = process.env.FRONTEND_ORIGIN || '*'
  app.use(cors({ origin }))

  // init db
  const pool = initPool()
  app.locals.pool = pool

  // init mailer
  if(process.env.SMTP_HOST && process.env.SMTP_USER){
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
    app.locals.mailer = transporter
  }

  app.use('/api', routes)

  app.listen(PORT, ()=>{
    console.log(`Server listening on ${PORT}`)
  })
}

main().catch(err=>{
  console.error('Failed to start server', err)
  process.exit(1)
})
