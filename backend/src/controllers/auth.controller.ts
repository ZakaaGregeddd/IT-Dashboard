import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserService } from '../services/user.service.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'USER']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedBody = registerSchema.parse(req.body);

      const existingUser = await UserService.findByEmail(parsedBody.email);
      if (existingUser) {
        return sendError(res, 'Email already registered', 400);
      }

      const hashedPassword = await hashPassword(parsedBody.password);
      const newUser = await UserService.createUser({
        email: parsedBody.email,
        passwordHash: hashedPassword,
        name: parsedBody.name,
        role: parsedBody.role,
      });

      return sendSuccess(res, newUser, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedBody = loginSchema.parse(req.body);

      const user = await UserService.findByEmail(parsedBody.email);
      if (!user) {
        return sendError(res, 'Invalid credentials', 401);
      }

      if (!user.isActive) {
        return sendError(res, 'User account is deactivated', 403);
      }

      const isPasswordValid = await comparePassword(parsedBody.password, user.passwordHash);
      if (!isPasswordValid) {
        return sendError(res, 'Invalid credentials', 401);
      }

      const payload = { userId: user.id, email: user.email, role: user.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      return sendSuccess(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
        'Login successful'
      );
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedBody = refreshSchema.parse(req.body);
      const decoded = verifyRefreshToken(parsedBody.refreshToken);

      const user = await UserService.findById(decoded.userId);
      if (!user || !user.isActive) {
        return sendError(res, 'Invalid or inactive user session', 401);
      }

      const payload = { userId: user.id, email: user.email, role: user.role };
      const accessToken = generateAccessToken(payload);

      return sendSuccess(res, { accessToken }, 'Access token refreshed');
    } catch (error) {
      next(error);
    }
  }
}
