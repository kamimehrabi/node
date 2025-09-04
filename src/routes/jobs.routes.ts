import { Router } from "express";
import { body, param } from "express-validator";
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
} from "../controllers/jobs.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/", getJobs);
router.get("/:id", param("id").isMongoId(), getJobById);

// Protected routes
router.use(requireAuth);

// Employer routes
router.post(
  "/",
  requireRole(["employer"]),
  body("title").notEmpty().trim(),
  body("description").notEmpty().trim(),
  body("location").notEmpty().trim(),
  body("employmentType")
    .optional()
    .isIn(["full-time", "part-time", "contract", "internship"]),
  body("experienceLevel")
    .optional()
    .isIn(["entry", "mid", "senior", "executive"]),
  body("skills").optional().isArray(),
  body("salary.min").optional().isNumeric(),
  body("salary.max").optional().isNumeric(),
  body("salary.currency").optional().isString(),
  body("expiresAt").optional().isISO8601(),
  createJob
);

router.get("/my/jobs", requireRole(["employer"]), getMyJobs);

router.put(
  "/:id",
  param("id").isMongoId(),
  body("title").optional().notEmpty().trim(),
  body("description").optional().notEmpty().trim(),
  body("location").optional().notEmpty().trim(),
  body("employmentType")
    .optional()
    .isIn(["full-time", "part-time", "contract", "internship"]),
  body("experienceLevel")
    .optional()
    .isIn(["entry", "mid", "senior", "executive"]),
  body("skills").optional().isArray(),
  body("salary.min").optional().isNumeric(),
  body("salary.max").optional().isNumeric(),
  body("salary.currency").optional().isString(),
  body("status").optional().isIn(["draft", "active", "paused", "closed"]),
  body("expiresAt").optional().isISO8601(),
  updateJob
);

router.delete("/:id", param("id").isMongoId(), deleteJob);

export default router;

