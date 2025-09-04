import { Router } from "express";
import authRoutes from "./auth.routes";
import jobsRoutes from "./jobs.routes";
import applicationsRoutes from "./applications.routes";
import profileRoutes from "./profile.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/jobs", jobsRoutes);
router.use("/applications", applicationsRoutes);
router.use("/profile", profileRoutes);

export default router;
