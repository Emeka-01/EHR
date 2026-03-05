# EHR Portal

Frontend: React + Vite  
Backend: Express (in `backend/`)

## Frontend Setup

1. Install frontend dependencies:
	- `npm install`
2. Configure frontend env:
	- Copy `.env.example` to `.env`
3. Start frontend:
	- `npm run dev`

Default frontend URL: `http://localhost:5173`

## Backend Setup

1. Install backend dependencies:
	- `cd backend`
	- `npm install`
2. Configure backend env:
	- Copy `backend/.env.example` to `backend/.env`
3. Start backend:
	- `npm run dev`

Default backend URL: `http://localhost:4001`

You can also run backend from the project root:

- `npm run backend:dev`

## Email Sending

- On Render Free, set `RESEND_API_KEY` (recommended) because Render Free blocks SMTP ports `25/465/587`.
- For local/dev or hosts that allow SMTP, you can set SMTP values in `backend/.env`.
- If neither Resend nor SMTP is configured, backend falls back to Ethereal test inbox and prints preview URLs in backend logs.

## Implemented Auth APIs

- Register + email verification link
- Resend verification email
- Login with lockout after failed attempts
- OTP verify/resend for lockout unlock
- Forgot password + reset password link
- Profile fetch/update with JWT auth
