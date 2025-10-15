const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const STORE = path.join(__dirname, 'credentials.json');

function readStore() {
  try {
    if (!fs.existsSync(STORE)) return null;
    const raw = fs.readFileSync(STORE, 'utf8');
    return JSON.parse(raw || 'null');
  } catch (e) { return null; }
}

function writeStore(obj) {
  try {
    fs.writeFileSync(STORE, JSON.stringify(obj, null, 2), 'utf8');
    return true;
  } catch (e) { return false; }
}

app.post('/signup', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const account = { name: name || '', email, password };
  const ok = writeStore(account);
  if (!ok) return res.status(500).json({ error: 'write failed' });
  res.json({ success: true });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const stored = readStore();
  if (!stored) return res.status(404).json({ error: 'no account' });
  if (stored.email === email && stored.password === password) return res.json({ success: true, name: stored.name });
  return res.status(401).json({ error: 'invalid credentials' });
});

// return stored account (for autofill); do not expose password in production
app.get('/account', (req, res) => {
  const stored = readStore();
  if (!stored) return res.status(404).json({ error: 'no account' });
  // return only the email and name to the client
  return res.json({ email: stored.email, name: stored.name });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server running on http://localhost:' + port));
