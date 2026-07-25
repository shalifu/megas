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

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
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
