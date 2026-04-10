require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// ✅ FIX: Use fallback port
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

// ✅ Health check route (important for Render)
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// ✅ Root API route
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

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// ✅ Start server
async function start() {
  try {
    const skipDb = process.env.SKIP_DB === 'true';

    // 🔐 Check JWT
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing.');
      process.exit(1);
    }

    if (!skipDb) {
      // 🗄️ Check Mongo URI
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        console.error('MONGODB_URI is missing.');
        process.exit(1);
      }

      // ✅ Connect DB
      await connectDB(uri);
      console.log('MongoDB Connected ✅');
    } else {
      console.log('Skipping DB connection (SKIP_DB=true)');
    }

    // ✅ FIX: Bind to 0.0.0.0 for Render
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });

  } catch (error) {
    console.error('Startup Error:', error);
    process.exit(1);
  }
}

// ✅ Run server
if (require.main === module) {
  start();
}

module.exports = { app, start };