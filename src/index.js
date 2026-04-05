require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Helpful when you open http://localhost:5000/api in the browser
app.get('/api', (req, res) => {
  res.json({
    name: 'todo-backend',
    message: 'API is running. Use these paths (not /api alone).',
    endpoints: {
      health: 'GET /api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      tasks: 'GET/POST /api/tasks (JWT required)',
      taskById: 'PATCH/DELETE /api/tasks/:id (JWT required)',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing. Copy .env.example to .env and set JWT_SECRET.');
    process.exit(1);
  }
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/todoBE';
  await connectDB(uri);
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { app, start };
