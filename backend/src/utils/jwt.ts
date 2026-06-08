import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
const ACCESS_EXP = process.env.JWT_ACCESS_EXPIRATION || '15m';
const REFRESH_EXP = process.env.JWT_REFRESH_EXPIRATION || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign({ userId: payload.userId, email: payload.email, role: payload.role }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXP as any,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign({ userId: payload.userId, email: payload.email, role: payload.role }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXP as any,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
};
