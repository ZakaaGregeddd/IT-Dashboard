import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserService } from '../services/user.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['ADMIN', 'USER']).optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export class UserController {
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAllUsers();
      return sendSuccess(res, users, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await UserService.findById(id);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      return sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedBody = createUserSchema.parse(req.body);

      const existingUser = await UserService.findByEmail(parsedBody.email);
      if (existingUser) {
        return sendError(res, 'Email already in use', 400);
      }

      const newUser = await UserService.createUser({
        email: parsedBody.email,
        passwordHash: parsedBody.password, // This will be hashed inside user.service or we can pass hashed pass
        name: parsedBody.name,
        role: parsedBody.role,
      });

      return sendSuccess(res, newUser, 'User created successfully by Admin', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsedBody = updateUserSchema.parse(req.body);

      const user = await UserService.findById(id);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      const updatedUser = await UserService.updateUser(id, parsedBody);
      return sendSuccess(res, updatedUser, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (req.user?.id === id) {
        return sendError(res, 'Admin cannot delete their own account', 400);
      }

      const user = await UserService.findById(id);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      await UserService.deleteUser(id);
      return sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
