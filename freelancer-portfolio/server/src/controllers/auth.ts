import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Store invalidated tokens (in production, use Redis or database)
const invalidatedTokens = new Set<string>();

const generateToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  const options: SignOptions = { 
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string
  };
  
  return jwt.sign({ userId }, jwtSecret, options);
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: `A user with this ${field} already exists`,
        },
        timestamp: new Date().toISOString()
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        jobTitle: true,
        bio: true,
        profilePicture: true,
        theme: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user account',
      },
      timestamp: new Date().toISOString()
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email/username or password',
        },
        timestamp: new Date().toISOString()
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email/username or password',
        },
        timestamp: new Date().toISOString()
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Return user data without password hash
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Login failed',
      },
      timestamp: new Date().toISOString()
    });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Add token to invalidated tokens set
      invalidatedTokens.add(token);
    }

    res.json({
      success: true,
      data: {
        message: 'Logged out successfully'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Logout failed',
      },
      timestamp: new Date().toISOString()
    });
  }
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
        timestamp: new Date().toISOString()
      });
    }

    // Get full user data
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        jobTitle: true,
        bio: true,
        profilePicture: true,
        theme: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: { user },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get user data',
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Helper function to check if token is invalidated
export const isTokenInvalidated = (token: string): boolean => {
  return invalidatedTokens.has(token);
};