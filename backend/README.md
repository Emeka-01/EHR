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
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

If SMTP variables are omitted, the app uses an Ethereal test inbox and prints preview links in backend logs.

## Seed User

A default account is seeded on first run:

- Email: `sarah@example.com`
- Password: `Test@1234`
