import mongoose, { Schema } from "mongoose";
import { IUser } from "./user.model";
import { IOrg } from "./organization.model";
import { IDiscussion } from "./discussion.model";
import { FeedbackStatus } from "@/types/enums";

export interface IFeedback extends Document {
  _id: string;
  giver: IUser;
  taker: IOrg;
  title: string;
  content: string;
  status: string;
  discussionsId: IDiscussion[];
}

const FeedbackSchema: Schema<IFeedback> = new mongoose.Schema(
  {
    giver: { type: Schema.Types.ObjectId, ref: "User" },
    taker: { type: Schema.Types.ObjectId, ref: "Organization" },
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
      max: [1000, "Content must be atmost 256 characters long!"],
    },
    status: {
      type: String,
      default: FeedbackStatus.Pending,
      enum: FeedbackStatus,
    },
    discussionsId: [{ type: Schema.Types.ObjectId, ref: "Discussion" }],
  },
  {
    timestamps: true,
  }
);

const Feedback =
  (mongoose.models.Feedback as mongoose.Model<IFeedback>) ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);

export default Feedback;
