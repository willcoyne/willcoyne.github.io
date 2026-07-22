# Self-hosted server for willcoyne.github.io

This folder provides a minimal Node/Express server to receive submissions, store them in MySQL, and send answers via SMTP.

Quick start
-----------

1. Copy `.env.example` to `.env` and edit values (DB connection, `ADMIN_API_KEY`, SMTP settings, and `FRONTEND_ORIGIN`).

2. Create the database and table (run the SQL in `migrations/init.sql`) — example using mysql client:

```bash
mysql -u root -p < migrations/init.sql
```

3. Install dependencies and start the server:

```bash
cd server
npm install
npm run dev   # or `npm start` for production
```

Docker (optional)
-----------------

You can bring up MySQL and the server with Docker Compose for quick testing:

```bash
cd server
docker compose up --build
```

The compose file starts a MySQL 8 container and the server (port 4000). Edit the env vars in `server/.env.example` or override environment values in `docker-compose.yml` before starting.

API
---

- `POST /api/submit` — accepts JSON { name, email, question, tier, amount, txn } and stores a record.
- `GET /api/questions` — admin only (set header `x-api-key: <ADMIN_API_KEY>`) returns recent submissions.
- `POST /api/questions/:id/answer` — admin only, body `{ answer }`. Sends email to submitter and marks question answered.

Notes
-----
- Protect the server behind HTTPS and a firewall. Use a strong `ADMIN_API_KEY`.
- For payments automation, integrate Stripe Checkout and handle webhooks to mark `tier='paid'` and store payment details.

SMTP / Email credentials
-----------------------

To send emails from the server you must provide SMTP credentials in `.env` (copy from `.env.example`). Example for Gmail (recommended to use an App Password):

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_USER=will17coyne@gmail.com`
- `SMTP_PASS=<your-app-password>`
- `EMAIL_FROM="William" <will17coyne@gmail.com>`

For Gmail you must enable 2FA and create an App Password to use as `SMTP_PASS`. Alternatively use SendGrid, Mailgun, or your hosting provider's SMTP.

