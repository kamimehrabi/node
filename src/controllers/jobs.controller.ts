import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
import {
  getPaginationOptions,
  getSortObject,
  PaginatedResult,
} from "../utils/pagination";
import { AuthRequest } from "../middleware/auth";
import {
  buildJobsListCacheKey,
  getCachedJson,
  setCachedJson,
  invalidateJobListCache,
} from "../utils/cache";

export async function getJobs(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, sort, order } = getPaginationOptions(req.query);
    const {
      search,
      location,
      employmentType,
      experienceLevel,
      minSalary,
      maxSalary,
    } = req.query;

    // Build filter
    const filter: any = {
      status: "active",
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    };

    if (search) {
      filter.$text = { $search: search as string };
    }

    if (location) {
      filter.location = { $regex: location as string, $options: "i" };
    }

    if (employmentType) {
      filter.employmentType = employmentType;
    }

    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    if (minSalary || maxSalary) {
      filter["salary.min"] = {};
      if (minSalary) filter["salary.min"].$gte = parseInt(minSalary as string);
      if (maxSalary)
        filter["salary.max"] = { $lte: parseInt(maxSalary as string) };
    }

    const skip = (page - 1) * limit;
    const sortObj = getSortObject(sort, order);

    const cacheKey = buildJobsListCacheKey({
      ...req.query,
      page,
      limit,
      sort,
      order,
    });
    const cached = await getCachedJson<PaginatedResult<any>>(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate("employer", "name email")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter),
    ]);

    const result: PaginatedResult<any> = {
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };

    await setCachedJson(cacheKey, result, 60);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getJobById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const job = await Job.findById(id).populate("employer", "name email");

    if (!job) {
      throw createError(404, "Job not found");
    }

    // Increment view count
    await Job.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });

    res.json(job);
  } catch (err) {
    next(err);
  }
}

export async function createJob(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user || req.user.role !== "employer") {
      throw createError(403, "Only employers can create jobs");
    }

    const jobData = {
      ...req.body,
      employer: req.user.sub,
    };

    const job = await Job.create(jobData);
    await job.populate("employer", "name email");

    await invalidateJobListCache();
    res.status(201).json(job);
  } catch (err) {
    next(err);
  }
}

export async function updateJob(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    if (!req.user) {
      throw createError(401, "Unauthorized");
    }

    const job = await Job.findById(id);
    if (!job) {
      throw createError(404, "Job not found");
    }

    // Check if user is the employer or admin
    if (job.employer.toString() !== req.user.sub && req.user.role !== "admin") {
      throw createError(403, "You can only update your own jobs");
    }

    const updatedJob = await Job.findByIdAndUpdate(id, req.body, {
      new: true,
    }).populate("employer", "name email");

    await invalidateJobListCache();
    res.json(updatedJob);
  } catch (err) {
    next(err);
  }
}

export async function deleteJob(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    if (!req.user) {
      throw createError(401, "Unauthorized");
    }

    const job = await Job.findById(id);
    if (!job) {
      throw createError(404, "Job not found");
    }

    // Check if user is the employer or admin
    if (job.employer.toString() !== req.user.sub && req.user.role !== "admin") {
      throw createError(403, "You can only delete your own jobs");
    }

    // Delete associated applications
    await Application.deleteMany({ job: id });
    await Job.findByIdAndDelete(id);
    await invalidateJobListCache();

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    next(err);
  }
}

export async function getMyJobs(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user || req.user.role !== "employer") {
      throw createError(403, "Only employers can view their jobs");
    }

    const { page, limit, sort, order } = getPaginationOptions(req.query);
    const skip = (page - 1) * limit;
    const sortObj = getSortObject(sort, order);

    const [jobs, total] = await Promise.all([
      Job.find({ employer: req.user.sub })
        .populate("employer", "name email")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments({ employer: req.user.sub }),
    ]);

    const result: PaginatedResult<any> = {
      data: jobs,
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
