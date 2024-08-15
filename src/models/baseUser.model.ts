import { Roles } from "@/types/enums";
import { Document, Schema } from "mongoose";

export interface IBaseUser extends Document {
  _id: string;
  email: string;
  password: string;
  avatar: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  token: string;
  role: string;
}

const baseUserSchema: Schema<IBaseUser> = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required!"],
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid email format.",
      ],
      trim: true,
      unique: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required!"],
      min: [8, "Password must be at least 8 characters long!"],
      max: [32, "Password must be 8-32 characters!"],
      trim: true,
      select: false,
    },

    avatar: {
      type: String,
    },

    verifyCode: {
      type: String,
      required: [true, "Verification code is required!"],
    },

    verifyCodeExpiry: {
      type: Date,
      required: [true, "Verification code expiry is required!"],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      required: [true, "Role is required!"],
      enum: Roles,
    },
  },
  { timestamps: true }
);

export default baseUserSchema;
