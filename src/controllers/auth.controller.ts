import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import createError from "http-errors";
import { User } from "../models/User";
import { signJwt } from "../utils/jwt";
import { sendEmail } from "../utils/email";

// In-memory tokens for demo; move to Redis for production
const emailTokens = new Map<string, string>();
const resetTokens = new Map<string, string>();

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password, name, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) throw createError(400, "Email already in use");
    const user = await User.create({ email, password, name, role });

    const token = crypto.randomBytes(24).toString("hex");
    emailTokens.set(token, user.id);
    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: `Click to verify: <a href="${
        req.headers.origin || ""
      }/verify-email?token=${token}">Verify</a>`,
    });

    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = req.body;
    const userId = emailTokens.get(token);
    if (!userId) throw createError(400, "Invalid token");
    const user = await User.findByIdAndUpdate(
      userId,
      { isEmailVerified: true },
      { new: true }
    );
    emailTokens.delete(token);
    res.json({
      ok: true,
      user: { id: user?.id, isEmailVerified: user?.isEmailVerified },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw createError(401, "Invalid credentials");
    const ok = await user.comparePassword(password);
    if (!ok) throw createError(401, "Invalid credentials");
    const token = signJwt({ sub: user.id, role: user.role }, "7d");
    res.json({ token });
  } catch (err) {
    next(err);
  }
}

export async function requestPasswordReset(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const token = crypto.randomBytes(24).toString("hex");
      resetTokens.set(token, user.id);
      await sendEmail({
        to: email,
        subject: "Password reset",
        html: `Reset link: <a href="${
          req.headers.origin || ""
        }/reset-password?token=${token}">Reset</a>`,
      });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token, password } = req.body;
    const userId = resetTokens.get(token);
    if (!userId) throw createError(400, "Invalid token");
    const user = await User.findById(userId);
    if (!user) throw createError(404, "User not found");
    user.password = password;
    await user.save();
    resetTokens.delete(token);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

