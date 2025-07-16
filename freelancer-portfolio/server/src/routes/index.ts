import { Router } from 'express';
import authRoutes from './auth';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'FreelanceForge API'
  });
});

// Auth routes
router.use('/auth', authRoutes);

export default router;