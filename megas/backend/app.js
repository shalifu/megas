const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const jobRoutes = require('./routes/jobRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const taskRoutes = require('./routes/taskRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const chefApplicationRoutes = require('./routes/chefApplicationRoutes');
const chefChatRoutes = require('./routes/chefChatRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const frontendDist = path.join(__dirname, '../frontend/dist');

// Updated to explicitly accept your cross-platform configuration layout
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: (origin, callback) => {
    // 1. Allows tool check software (like Postman or server-to-server calls)
    // 2. Matches exact system arrays
    // 3. Dynamic wildcard checking fallback logic to handle Vercel deployment variations
    if (!origin || allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', orderRoutes);
app.use('/api', jobRoutes);
app.use('/api', chatRoutes);
app.use('/api', notificationRoutes);
app.use('/api', taskRoutes);
app.use('/api', uploadRoutes);
app.use('/api', chefApplicationRoutes);
app.use('/api/chat', chefChatRoutes);
app.use('/api', contactRoutes);

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

module.exports = app;
