import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Middleware Keamanan
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Sesuaikan di production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Parser request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Pemasangan route API
app.use('/api', routes);

// Handler error global
app.use(errorHandler);

export default app;
