# Darul-Quran - Minimal Backend Stub

This repo contains a minimal Node/Express backend to verify Paystack payments and store simple records in SQLite.

Setup

1. Install dependencies

```bash
npm install
```

2. Copy environment file and set your Paystack secret key

```bash
cp .env.example .env
# edit .env and set PAYSTACK_SECRET
```

3. Start server

```bash
npm start
```

Endpoints

- `GET /api/payments` — list stored payments
- `GET /api/applications` — list stored applications
- `GET /api/payments/verify?reference=REF` — verify a transaction with Paystack and store result
- `POST /webhooks/paystack` — webhook endpoint (verify `x-paystack-signature` HMAC)

Notes

- The server serves the existing static files (admin dashboard in `/admin`) and the frontend register form.
- You must set `PAYSTACK_SECRET` in `.env` for verification and webhook verification to work.
- This is a minimal stub; for production add authentication, input validation, and robust error handling.
