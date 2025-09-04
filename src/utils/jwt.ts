import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface JwtPayload {
  sub: string;
  role: string;
}

export function signJwt(payload: JwtPayload, expiresIn: string = "7d") {
  return jwt.sign(payload, env.jwtSecret, { expiresIn });
}

export function verifyJwt<T = JwtPayload>(token: string): T {
  return jwt.verify(token, env.jwtSecret) as unknown as T;
}

