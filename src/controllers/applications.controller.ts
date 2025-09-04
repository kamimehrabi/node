import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { Application } from "../models/Application";
import { Job } from "../models/Job";
import {
  getPaginationOptions,
  getSortObject,
  PaginatedResult,
} from "../utils/pagination";
import { AuthRequest } from "../middleware/auth";

export async function applyToJob(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user || req.user.role !== "seeker") {
      throw createError(403, "Only job seekers can apply to jobs");
    }

    const { jobId } = req.params;
    const { coverLetter } = req.body;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      throw createError(404, "Job not found");
    }

    if (
      job.status !== "active" ||
      (job.expiresAt && job.expiresAt < new Date())
    ) {
      throw createError(400, "This job is no longer accepting applications");
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.sub,
    });

    if (existingApplication) {
      throw createError(400, "You have already applied to this job");
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user.sub,
      coverLetter,
      resume: req.file?.path, // From multer middleware
    });

    await application.populate([
      { path: "job", select: "title employer" },
      { path: "applicant", select: "name email" },
    ]);

    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
}

export async function getMyApplications(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user || req.user.role !== "seeker") {
      throw createError(403, "Only job seekers can view their applications");
    }

    const { page, limit, sort, order } = getPaginationOptions(req.query);
    const skip = (page - 1) * limit;
    const sortObj = getSortObject(sort, order);

    const [applications, total] = await Promise.all([
      Application.find({ applicant: req.user.sub })
        .populate("job", "title location employmentType salary status")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments({ applicant: req.user.sub }),
    ]);

    const result: PaginatedResult<any> = {
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getJobApplications(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user || req.user.role !== "employer") {
      throw createError(403, "Only employers can view job applications");
    }

    const { jobId } = req.params;

    // Verify the job belongs to the employer
    const job = await Job.findOne({ _id: jobId, employer: req.user.sub });
    if (!job) {
      throw createError(
        404,
        "Job not found or you don't have permission to view its applications"
      );
    }

    const { page, limit, sort, order } = getPaginationOptions(req.query);
    const skip = (page - 1) * limit;
    const sortObj = getSortObject(sort, order);

    const [applications, total] = await Promise.all([
      Application.find({ job: jobId })
        .populate("applicant", "name email")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments({ job: jobId }),
    ]);

    const result: PaginatedResult<any> = {
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateApplicationStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user || req.user.role !== "employer") {
      throw createError(403, "Only employers can update application status");
    }

    const { applicationId } = req.params;
    const { status, notes } = req.body;

    const application = await Application.findById(applicationId).populate(
      "job"
    );
    if (!application) {
      throw createError(404, "Application not found");
    }

    // Verify the job belongs to the employer
    const job = application.job as any;
    if (job.employer.toString() !== req.user.sub) {
      throw createError(
        403,
        "You can only update applications for your own jobs"
      );
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status, notes },
      { new: true }
    ).populate("applicant", "name email");

    res.json(updatedApplication);
  } catch (err) {
    next(err);
  }
}

export async function getApplicationById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate("job", "title employer")
      .populate("applicant", "name email");

    if (!application) {
      throw createError(404, "Application not found");
    }

    // Check permissions
    const job = application.job as any;
    const canView =
      req.user &&
      (req.user.sub === application.applicant._id.toString() || // Applicant
        req.user.sub === job.employer.toString() || // Employer
        req.user.role === "admin"); // Admin

    if (!canView) {
      throw createError(
        403,
        "You don't have permission to view this application"
      );
    }

    res.json(application);
  } catch (err) {
    next(err);
  }
}
