import createError from "http-errors";
import { NextFunction, Request, Response } from "express";

// 404 handler
export function notFound(req: Request, res: Response, next: NextFunction) {
  next(createError(404, "Not Found"));
}

// Centralized error handler
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const response: any = { message };
  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }
  res.status(status).json(response);
}

