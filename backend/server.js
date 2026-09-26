require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

// Allow requests from Vercel deployments, FRONTEND_URL env var, localhost, and local network devices
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman, Render health checks)
    if (!origin) return callback(null, true);

    const customOrigins = (process.env.FRONTEND_URL || '')
      .split(',')
      .map((url) => url.trim().replace(/\/$/, ''))
      .filter(Boolean);

    const isAllowedCustom = customOrigins.includes(origin);
    const isVercel = origin.endsWith('.vercel.app') || origin.includes('vercel.app');
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes(':5173') || origin.includes(':3000');

    if (isAllowedCustom || isVercel || isLocal) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check endpoint for Render / monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));

app.get('/api/settings', require('./controllers/adminController').getSettings);

app.get('/', (req, res) => res.json({ message: '🎓 RKD School API is running!' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   → Mode: ${process.env.NODE_ENV || 'development'}`);
});
