import mongoose, { Schema, Document, Types } from "mongoose";

export type ApplicationStatus =
  | "pending"
  | "reviewed"
  | "shortlisted"
  | "rejected"
  | "hired";

export interface IApplication extends Document {
  job: Types.ObjectId;
  applicant: Types.ObjectId;
  coverLetter?: string;
  resume?: string; // File path
  status: ApplicationStatus;
  appliedAt: Date;
  reviewedAt?: Date;
  notes?: string; // Internal notes by employer
}

const ApplicationSchema = new Schema<IApplication>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    coverLetter: { type: String, maxlength: 2000 },
    resume: { type: String }, // File path
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected", "hired"],
      default: "pending",
    },
    appliedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    notes: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate applications
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Pre-save middleware
ApplicationSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status !== "pending" &&
    !this.reviewedAt
  ) {
    this.reviewedAt = new Date();
  }
  next();
});

// Post-save middleware to update job applications count
ApplicationSchema.post("save", async function (doc) {
  if (doc.isNew) {
    await mongoose.model("Job").findByIdAndUpdate(doc.job, {
      $inc: { applicationsCount: 1 },
    });
  }
});

// Post-remove middleware to update job applications count
ApplicationSchema.post("remove", async function (doc) {
  await mongoose.model("Job").findByIdAndUpdate(doc.job, {
    $inc: { applicationsCount: -1 },
  });
});

export const Application = mongoose.model<IApplication>(
  "Application",
  ApplicationSchema
);

