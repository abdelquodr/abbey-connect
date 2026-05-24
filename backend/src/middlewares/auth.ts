import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';
import { roleRights } from '../config/roles';
import { NextFunction, Request, Response } from 'express';
import { User, TokenType } from '@prisma/client';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import prisma from '../client';

const accessCookieName = 'accessToken';

const parseCookies = (cookieHeader?: string) => {
  if (!cookieHeader) {
    return {} as Record<string, string>;
  }

  return cookieHeader.split(';').reduce<Record<string, string>>((cookies, entry) => {
    const [rawKey, ...rawValue] = entry.trim().split('=');
    if (!rawKey) {
      return cookies;
    }
    cookies[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.join('='));
    return cookies;
  }, {});
};

const extractAccessToken = (req: Request) => {
  const bearerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;
  const cookieToken = parseCookies(req.headers.cookie)?.[accessCookieName];
  return bearerToken ?? cookieToken;
};

const auth =
  (...requiredRights: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = extractAccessToken(req);
    if (!accessToken) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    try {
      const payload = jwt.verify(accessToken, config.jwt.secret) as unknown as {
        sub: number;
        type: string;
      };
      if (payload.type !== TokenType.ACCESS) {
        throw new Error('Invalid token type');
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          headline: true,
          bio: true,
          city: true,
          avatarUrl: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
      }

      const userRights = roleRights.get(user.role) ?? [];
      const hasRequiredRights = requiredRights.every((requiredRight) =>
        userRights.includes(requiredRight)
      );

      if (requiredRights.length && !hasRequiredRights && req.params.userId !== String(user.id)) {
        return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }

      req.user = user as User;
      return next();
    } catch (error) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
  };

export default auth;
