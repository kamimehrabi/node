import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "seeker" | "employer" | "admin";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  isEmailVerified: boolean;
  isEmployer: boolean;
  isSeeker: boolean;
  googleId?: string;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 6 },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["seeker", "employer", "admin"],
      default: "seeker",
    },
    isEmailVerified: { type: Boolean, default: false },
    googleId: { type: String },
  },
  { timestamps: true }
);

UserSchema.virtual("isEmployer").get(function (this: IUser) {
  return this.role === "employer";
});

UserSchema.virtual("isSeeker").get(function (this: IUser) {
  return this.role === "seeker";
});

UserSchema.pre("save", async function (next) {
  const user = this as IUser;
  if (!user.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);

