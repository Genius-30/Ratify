import mongoose, { ObjectId, Schema } from "mongoose";

export enum ParticipantType {
  User = "User",
  Organization = "Organization",
}

export interface IDiscussion extends Document {
  _id: string;
  sender: {
    id: ObjectId;
    type: ParticipantType;
  };
  receiver: {
    id: ObjectId;
    type: ParticipantType;
  };
  feedbackId: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const DiscussionSchema: Schema<IDiscussion> = new mongoose.Schema(
  {
    sender: {
      id: { type: Schema.Types.ObjectId, required: true },
      type: { type: String, enum: ParticipantType, required: true },
    },
    receiver: {
      id: { type: Schema.Types.ObjectId, required: true },
      type: { type: String, enum: ParticipantType, required: true },
    },
    feedbackId: {
      type: Schema.Types.ObjectId,
      required: [true, "Feedback ID is required!"],
    },
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
