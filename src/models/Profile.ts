import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProfile extends Document {
  user: Types.ObjectId;
  headline?: string;
  bio?: string;
  location?: string;
  skills: string[];
  avatarPath?: string;
  avatarThumbPath?: string;
  resumePath?: string;
}

const ProfileSchema = new Schema<IProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
      index: true,
    },
    headline: { type: String, maxlength: 120 },
    bio: { type: String, maxlength: 2000 },
    location: { type: String, maxlength: 120 },
    skills: [{ type: String, trim: true }],
    avatarPath: { type: String },
    avatarThumbPath: { type: String },
    resumePath: { type: String },
  },
  { timestamps: true }
);

export const Profile = mongoose.model<IProfile>("Profile", ProfileSchema);
