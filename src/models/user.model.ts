import mongoose, { Schema } from "mongoose";
import { IFeedback } from "./feedback.model";
import baseUserSchema, { IBaseUser } from "./baseUser.model";
import { IOrg } from "./organization.model";
import { comparePassword, hashPassword } from "@/utils/password";

export interface IUser extends IBaseUser {
  fullName: string;
  username: string;
  feedbacks: IFeedback[];
  allowedSentMessageTo: IOrg[];
}

const UserSchema: Schema<IUser> = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required!"],
      min: [3, "Full name must be atleast 3 characters long!"],
      max: [32, "Full name must be 3-32 characters!"],
      trim: true,
    },

    username: {
      type: String,
      required: [true, "Username is required!"],
      min: [3, "Username must be atleast 3 characters long!"],
      max: [20, "Username must be 3-32 characters!"],
      match: [
        /^[a-zA-Z0-9_]{3,16}$/,
        "Username can only contain letters, numbers and underscores.",
      ],
      trim: true,
      unique: true,
      index: true,
    },

    feedbacks: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Feedback",
      },
    ],

    allowedSentMessageTo: [
      { type: mongoose.Types.ObjectId, ref: "Organization" },
    ],
  },
  { timestamps: true }
);

UserSchema.add(baseUserSchema.obj);

const preSaveUser = async function (
  this: IUser,
  next: CallableFunction
): Promise<void> {
  if (!this.isModified("password")) return next();

  try {
    const hash = await hashPassword(this.password);
    this.password = hash;
    next();
  } catch (error) {
    next(error);
  }
};
UserSchema.pre<IUser>("save", preSaveUser);

UserSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  try {
    return await comparePassword(password, this.password);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
