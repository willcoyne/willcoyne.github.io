How this site works
-------------------

This is a simple static site that lets visitors submit questions or prompts to William. There are two options:

- Free: submit a question for William to answer in regular order.
- Paid priority: visitor pays an amount (via PayPal.me) and marks the submission as priority.

How submissions are delivered
----------------------------

This static site does not include a server. When a visitor clicks "Submit question" it opens the visitor's email client with a pre-filled email addressed to the owner email configured in `index.html`.

Configuration (required)
------------------------

1. Open `index.html` and edit the script near the bottom.
2. Set `ownerEmail` to the email address that should receive submissions.
3. (Optional) Set `paypalMe` to your PayPal.me username so the "Pay with PayPal" button opens your payment link.

Notes on paid priority
----------------------

- The site is static and cannot automatically verify payments. The current flow is:
  1. Visitor enters an amount and clicks "Pay with PayPal" which opens `https://paypal.me/YOURNAME/AMOUNT`.
  2. After completing payment, the visitor pastes the payment transaction ID into the form and submits.
  3. The form opens the visitor's email client to send the question and transaction ID to the owner. The owner manually verifies payment.

Optional: automatic backend
---------------------------

If you want automatic delivery and payment verification, consider one of these approaches:

- Use Formspree or Netlify Forms to receive submissions server-side and send email notifications.
- Use Stripe with a small server (e.g., serverless function) to create Checkout sessions for variable amounts and receive webhooks to mark priority automatically.

If you want, I can help integrate Formspree/Netlify or scaffold a small serverless Stripe endpoint — tell me which provider you'd prefer and your hosting choice.

Self-hosted server
------------------

This repo now includes a simple self-hosted server scaffold under the `server/` folder that stores submissions in MySQL and can send answers via SMTP. See `server/README.md` for setup steps.
The React app also includes a basic admin UI available at `/admin` that accepts your `ADMIN_API_KEY` to list and answer submissions.

Local testing
-------------

Open `index.html` in a browser to test the UI. Configure `ownerEmail` before relying on the mailto submission.

Vite + React
-------------

This repository now includes a Vite + React scaffold. Install deps and run the dev server:

```bash
npm install
npm run dev
```

Open the local dev server URL printed by Vite to view the site.

Security and privacy
--------------------

- Email submission uses the visitor's email client — the message is sent by the visitor, not via this site.
- Payments are handled by PayPal when the visitor clicks the payment link.

Contact
-------

If you'd like me to wire up an automated backend (Formspree, Netlify, or Stripe serverless), reply with which service you prefer and I'll implement it.
