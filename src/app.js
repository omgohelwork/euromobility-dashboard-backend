import express from 'express';
import cors from 'cors';
import cityRoutes from './routes/cityRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import indicatorRoutes from './routes/indicatorRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import yearRoutes from './routes/yearRoutes.js';
import complexIndicatorRoutes from './routes/complexIndicatorRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { connectDB } from './config/db.js';

const app = express();

app.use(cors());

// Ensure DB is connected before any route (required for Vercel serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Ensure UTF-8 for responses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'dashboard-api' });
});

app.use('/api/cities', cityRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/indicators', indicatorRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/years', yearRoutes);
app.use('/api/complex-indicators', complexIndicatorRoutes);
app.use('/api/auth', authRoutes);

app.use(errorHandler);

export default app;
