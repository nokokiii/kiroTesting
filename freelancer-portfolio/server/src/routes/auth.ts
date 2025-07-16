import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, me } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, registerSchema, loginSchema } from '../utils/validation';

const router = Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later',
    },
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Registration endpoint
router.post('/register', 
  authLimiter,
  validateRequest(registerSchema),
  register
);

// Login endpoint
router.post('/login',
  authLimiter,
  validateRequest(loginSchema),
  login
);

// Logout endpoint (requires authentication)
router.post('/logout',
  authenticateToken,
  logout
);

// Get current user endpoint (requires authentication)
router.get('/me',
  authenticateToken,
  me
);

export default router;