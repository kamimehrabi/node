import { Router } from "express";
import { body } from "express-validator";
import { requireAuth } from "../middleware/auth";
import { uploadProfileImage, uploadResume } from "../middleware/upload";
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  uploadResumeToProfile,
} from "../controllers/profile.controller";

const router = Router();

router.use(requireAuth);

router.get("/me", getMyProfile);

router.put(
  "/me",
  body("headline").optional().isLength({ max: 120 }),
  body("bio").optional().isLength({ max: 2000 }),
  body("location").optional().isLength({ max: 120 }),
  body("skills").optional().isArray(),
  updateMyProfile
);

router.post("/me/avatar", uploadProfileImage.single("avatar"), uploadAvatar);
router.post("/me/resume", uploadResume.single("resume"), uploadResumeToProfile);

export default router;
