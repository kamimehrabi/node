import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { AuthRequest } from "../middleware/auth";
import { Profile } from "../models/Profile";

export async function getMyProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) throw createError(401, "Unauthorized");
    let profile = await Profile.findOne({ user: req.user.sub }).lean();
    if (!profile) {
      profile = (
        await Profile.create({ user: req.user.sub, skills: [] })
      ).toObject();
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) throw createError(401, "Unauthorized");
    const { headline, bio, location, skills } = req.body;
    const update: any = { headline, bio, location };
    if (Array.isArray(skills)) update.skills = skills;
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.sub },
      { $set: update },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatar(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) throw createError(401, "Unauthorized");
    if (!req.file) throw createError(400, "Avatar file is required");

    const inputPath = req.file.path;
    const fileName = path.basename(inputPath);
    const thumbName = `thumb-${fileName}`;
    const thumbDir = "thumbnails";
    if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });
    const thumbPath = path.join(thumbDir, thumbName);

    await sharp(inputPath).resize(200, 200).toFile(thumbPath);

    const profile = await Profile.findOneAndUpdate(
      { user: req.user.sub },
      { $set: { avatarPath: inputPath, avatarThumbPath: thumbPath } },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function uploadResumeToProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) throw createError(401, "Unauthorized");
    if (!req.file) throw createError(400, "Resume file is required");
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.sub },
      { $set: { resumePath: req.file.path } },
      { upsert: true, new: true }
    );
    res.json(profile);
  } catch (err) {
    next(err);
  }
}
