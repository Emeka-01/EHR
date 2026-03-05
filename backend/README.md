# EHR Backend

Express backend for authentication, email verification, lockout OTP, and password reset.

## Setup

1. Install dependencies:
   - `npm install`
2. Create env file:
   - Copy `.env.example` to `.env`
3. Start server:
   - `npm run dev`

Default URL: `http://localhost:4001`

## Environment Variables

- `PORT` - backend port
- `FRONTEND_URL` - frontend app URL used in email links
- `JWT_SECRET` - secret for signing auth tokens
- `JWT_EXPIRES_IN` - token expiration (e.g. `1d`)
- `RESEND_API_KEY`, `RESEND_FROM` (recommended for Render Free)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

Email sending priority is:

1. Resend API (if `RESEND_API_KEY` is set)
2. SMTP (if SMTP vars are set)
3. Ethereal test inbox fallback (local/testing)

Render Free blocks outbound SMTP ports `25/465/587`, so use `RESEND_API_KEY` on Render Free.

## Seed User

A default account is seeded on first run:

- Email: `sarah@example.com`
- Password: `Test@1234`
