import express from 'express';
import router from './src/routes/index.js';
import corsMiddleware from './src/middlewares/corsMiddleware.js';
import {constants} from "node:http2";
import pool from './src/lib/conn.js';

const app = express();
// eslint-disable-next-line no-undef
const PORT = process.env.PORT_BACKEND || 8080;

app.use(express.json());
app.use(express.urlencoded());

app.use(corsMiddleware);

// Test koneksi database (opsional)
try {
  await pool.query('SELECT NOW()');
  console.log('✅ Database connected successfully.');
} catch (error) {
  console.error('❌ Database connection failed:', error);
  // eslint-disable-next-line no-undef
  process.exit(1);
}

// arahkan ke routes
app.use(router);

// Route default
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend is running' 
  });
});

app.all("{*all}", function (req, res) {
  res.status(constants.HTTP_STATUS_NOT_FOUND).json({
    success: false,
    message: "Resources Not Found",
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});