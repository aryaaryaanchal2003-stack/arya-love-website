require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: true, methods: ['GET','POST'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '50kb' }));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false }));
const Submission = mongoose.model('Submission', new mongoose.Schema({
  name: { type: String, maxlength: 60, default: '' },
  answers: [{ question: { type: String, maxlength: 1000 }, answer: { type: String, maxlength: 3000 } }],
  submittedAt: { type: Date, default: Date.now }
}, { versionKey: false }));
app.get('/', (_req,res) => res.json({ ok: true, message: 'Love website API is running ❤️' }));
app.get('/health', (_req,res) => res.json({ ok: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'not connected' }));
app.post('/api/submissions', async (req,res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'Database is not ready' });
    const { name = '', answers } = req.body || {};
    if (!Array.isArray(answers) || answers.length !== 10 || answers.some(a => !a || typeof a.question !== 'string' || typeof a.answer !== 'string' || !a.answer.trim())) return res.status(400).json({ error: 'Please answer all questions' });
    const saved = await Submission.create({ name: String(name).slice(0,60), answers: answers.map(a => ({ question: a.question.slice(0,1000), answer: a.answer.trim().slice(0,3000) })) });
    res.status(201).json({ ok: true, id: saved._id });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not save answers' }); }
});
app.post('/api/admin/login', (req,res) => {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !process.env.JWT_SECRET) return res.status(503).json({ error: 'Admin is not configured yet' });
  if (!req.body || req.body.password !== password) return res.status(401).json({ error: 'Invalid admin password' });
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});
app.get('/api/admin/submissions', async (req,res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const rows = await Submission.find().sort({ submittedAt: -1 }).limit(100).lean();
    res.json(rows);
  } catch (e) { if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') return res.status(401).json({ error: 'Please log in again' }); console.error(e); res.status(500).json({ error: 'Could not load submissions' }); }
});
const port = process.env.PORT || 3000;
async function start(){
  if (!process.env.MONGODB_URI) { console.error('Missing MONGODB_URI environment variable'); process.exit(1); }
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, '0.0.0.0', () => console.log(`API listening on ${port}`));
}
start().catch(e => { console.error('Database connection failed:', e.message); process.exit(1); });
