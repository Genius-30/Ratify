import mongoose, { ObjectId, Schema } from "mongoose";

export interface IDiscussion extends Document {
  _id: string;
  sender: ObjectId;
  receiver: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const DiscussionSchema: Schema<IDiscussion> = new mongoose.Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    receiver: { type: Schema.Types.ObjectId, ref: "User" },
    content: {
      type: String,
      required: [true, "Discussion content is required!"],
      max: [120, "Discussion content must be atmost 120 characters long!"],
    },
  },
  {
    timestamps: true,
  }
);

const Discussion =
  (mongoose.models.Discussion as mongoose.Model<IDiscussion>) ||
  mongoose.model<IDiscussion>("Discussion", DiscussionSchema);

export default Discussion;
