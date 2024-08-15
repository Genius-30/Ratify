import mongoose, { Schema } from "mongoose";
import { IUser } from "./user.model";
import { IOrg } from "./organization.model";

export interface IFeedback extends Document {
  _id: string;
  owner: IUser;
  receiver: IOrg;
  title: string;
  content: string;
  rating: number;
}

const FeedbackSchema: Schema<IFeedback> = new mongoose.Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    receiver: { type: Schema.Types.ObjectId, ref: "Organization" },
    title: {
      type: String,
      required: [true, "Title is required!"],
      min: [3, "Title must be atleast 3 characters long!"],
      max: [120, "Title must be atmost 120 characters long!"],
    },
    content: {
      type: String,
      required: [true, "Content is required!"],
      min: [3, "Content must be atleast 3 characters long!"],
      max: [256, "Content must be atmost 256 characters long!"],
    },
    rating: { type: Number, min: 1, max: 5 },
  },
  {
    timestamps: true,
  }
);

const Feedback =
  (mongoose.models.Feedback as mongoose.Model<IFeedback>) ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);

export default Feedback;
