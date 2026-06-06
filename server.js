require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const crypto = require('crypto');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET || '';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve admin and public files
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/', express.static(path.join(__dirname)));

// List payments
app.get('/api/payments', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, reference as ref, amount, email, status, verified_at, created_at FROM payments ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List applications
app.get('/api/applications', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, full_name, email, state, country, paystack_ref, amount, payment_status, application_status, created_at FROM applications ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify a Paystack reference and store result
app.get('/api/payments/verify', async (req, res) => {
  const ref = req.query.reference;
  if (!ref) return res.status(400).json({ error: 'reference query parameter required' });
  if (!PAYSTACK_SECRET) return res.status(500).json({ error: 'PAYSTACK_SECRET not configured' });

  try {
    const resp = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` }
    });
    const data = await resp.json();

    if (!data.status) {
      return res.status(400).json(data);
    }

    const t = data.data;
    // upsert payment
    const insert = db.prepare(`INSERT OR REPLACE INTO payments (reference, amount, email, status, raw_response, verified_at)
      VALUES (@reference, @amount, @email, @status, @raw_response, @verified_at)`);

    insert.run({
      reference: t.reference,
      amount: t.amount / 100, // convert kobo to naira
      email: t.customer?.email || null,
      status: t.status,
      raw_response: JSON.stringify(t),
      verified_at: new Date().toISOString()
    });

    // Optionally update application record matching reference
    const updApp = db.prepare('UPDATE applications SET payment_status = ? WHERE paystack_ref = ?');
    updApp.run(t.status, t.reference);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Paystack webhook receiver
app.post('/webhooks/paystack', express.raw({ type: '*/*' }), (req, res) => {
  if (!PAYSTACK_SECRET) return res.status(500).end('missing secret');

  const signature = req.headers['x-paystack-signature'];
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(req.body).digest('hex');
  if (hash !== signature) {
    return res.status(401).end('invalid signature');
  }

  const event = JSON.parse(req.body.toString());
  const evtName = event.event;
  const t = event.data;

  // store/update payment
  try {
    const insert = db.prepare(`INSERT OR REPLACE INTO payments (reference, amount, email, status, raw_response, verified_at)
      VALUES (@reference, @amount, @email, @status, @raw_response, @verified_at)`);

    insert.run({
      reference: t.reference,
      amount: (t.amount || 0) / 100,
      email: t.customer?.email || null,
      status: t.status || (t.gateway_response || null),
      raw_response: JSON.stringify(t),
      verified_at: new Date().toISOString()
    });

    // update application payment_status if reference matches
    const updApp = db.prepare('UPDATE applications SET payment_status = ? WHERE paystack_ref = ?');
    updApp.run(t.status, t.reference);
  } catch (err) {
    console.error('db save error', err);
  }

  res.status(200).send('ok');
});

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
