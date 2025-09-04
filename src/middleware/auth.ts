import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { verifyJwt, JwtPayload } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export function requireAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(createError(401, "Unauthorized"));
  }
  const token = header.slice(7);
  try {
    const payload = verifyJwt<JwtPayload>(token);
    req.user = payload;
    next();
  } catch {
    next(createError(401, "Invalid token"));
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(createError(401, "Unauthorized"));
    if (!roles.includes(req.user.role))
      return next(createError(403, "Forbidden"));
    next();
  };
}

