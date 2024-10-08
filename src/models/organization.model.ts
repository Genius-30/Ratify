import mongoose, { Schema } from "mongoose";
import baseUserSchema, { IBaseUser } from "./baseUser.model";
import { Industries } from "@/types/enums";
import { comparePassword, hashPassword } from "@/utils/password.util";

export interface IOrg extends IBaseUser {
  organizationName: string;
  organizationBio: string;
  industry: string;
  topExecutives: string;
  links: Array<String>;
  orgMedia: Array<String>;
}

const OrgSchema: Schema<IOrg> = new mongoose.Schema({
  organizationName: {
    type: String,
    required: [true, "Organization name is required!"],
    min: [2, "Organization name must be atleast 2 characters long!"],
    max: [32, "Organization name must be 2-100 characters!"],
  },

  organizationBio: {
    type: String,
    required: [true, "Organization bio is required!"],
    min: [50, "Organization bio must be atleast 50 characters long!"],
    max: [1000, "Organization bio must be 50-1000 characters!"],
  },

  industry: {
    type: String,
    required: [true, "Industry name is required!"],
    enum: Industries,
  },

  topExecutives: {
    type: String,
    required: [true, "Top executives name is required!"],
  },

  links: {
    type: [String],
    default: [],
  },

  orgMedia: {
    type: [String],
    required: [true, "Images required for creating an orgnization account"],
    min: [1, "Atleast one image is required!"],
    max: [10, "Atmost 10 images are allowed"],
  },
});

OrgSchema.add(baseUserSchema.obj);

const preSaveOrg = async function (
  this: IOrg,
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
OrgSchema.pre<IOrg>("save", preSaveOrg);

OrgSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  try {
    return await comparePassword(password, this.password);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

const Org =
  (mongoose.models.Organization as mongoose.Model<IOrg>) ||
  mongoose.model<IOrg>("Organization", OrgSchema);

export default Org;
