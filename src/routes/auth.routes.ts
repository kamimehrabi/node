import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controller";

const router = Router();

router.post(
  "/register",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("name").notEmpty(),
  body("role").optional().isIn(["seeker", "employer", "admin"]),
  register
);

router.post(
  "/login",
  body("email").isEmail(),
  body("password").notEmpty(),
  login
);

router.post("/verify-email", body("token").notEmpty(), verifyEmail);

router.post("/password/request", body("email").isEmail(), requestPasswordReset);
router.post(
  "/password/reset",
  body("token").notEmpty(),
  body("password").isLength({ min: 6 }),
  resetPassword
);

export default router;

