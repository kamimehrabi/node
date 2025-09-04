import { Router } from "express";
import { body, param } from "express-validator";
import {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getApplicationById,
} from "../controllers/applications.controller";
import { requireAuth, requireRole } from "../middleware/auth";
import { uploadResume } from "../middleware/upload";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Job seeker routes
router.post(
  "/jobs/:jobId/apply",
  param("jobId").isMongoId(),
  body("coverLetter").optional().isLength({ max: 2000 }),
  uploadResume.single("resume"),
  requireRole(["seeker"]),
  applyToJob
);

router.get("/my/applications", requireRole(["seeker"]), getMyApplications);

// Employer routes
router.get(
  "/jobs/:jobId/applications",
  param("jobId").isMongoId(),
  requireRole(["employer"]),
  getJobApplications
);

router.put(
  "/:applicationId/status",
  param("applicationId").isMongoId(),
  body("status").isIn([
    "pending",
    "reviewed",
    "shortlisted",
    "rejected",
    "hired",
  ]),
  body("notes").optional().isLength({ max: 1000 }),
  requireRole(["employer"]),
  updateApplicationStatus
);

// Shared route (both seekers and employers can view)
router.get(
  "/:applicationId",
  param("applicationId").isMongoId(),
  getApplicationById
);

export default router;
