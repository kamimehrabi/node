import mongoose, { Schema, Document, Types } from "mongoose";

export type JobStatus = "draft" | "active" | "paused" | "closed";

export interface IJob extends Document {
  title: string;
  description: string;
  location: string;
  salary?: {
    min?: number;
    max?: number;
    currency: string;
  };
  employmentType: "full-time" | "part-time" | "contract" | "internship";
  experienceLevel: "entry" | "mid" | "senior" | "executive";
  skills: string[];
  status: JobStatus;
  employer: Types.ObjectId;
  applicationsCount: number;
  viewsCount: number;
  isActive: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true, index: "text" },
    description: { type: String, required: true, index: "text" },
    location: { type: String, required: true, trim: true, index: "text" },
    salary: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, default: "USD" },
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      default: "full-time",
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "executive"],
      default: "entry",
    },
    skills: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["draft", "active", "paused", "closed"],
      default: "draft",
    },
    employer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    applicationsCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    publishedAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

// Virtual for isActive
JobSchema.virtual("isActive").get(function (this: IJob) {
  return (
    this.status === "active" && (!this.expiresAt || this.expiresAt > new Date())
  );
});

// Index for text search
JobSchema.index({
  title: "text",
  description: "text",
  location: "text",
  skills: "text",
});

// Static method for active jobs
JobSchema.statics.findActive = function () {
  return this.find({
    status: "active",
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ],
  });
};

// Pre-save middleware
JobSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "active" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }
  next();
});

export const Job = mongoose.model<IJob>("Job", JobSchema);

