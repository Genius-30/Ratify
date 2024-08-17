import mongoose, { ObjectId, Schema } from "mongoose";

export interface IRating extends Document {
  _id: string;
  ratedBy: ObjectId;
  ratedTo: ObjectId;
  number: number;
}

const RatingSchema: Schema<IRating> = new mongoose.Schema({
  ratedBy: { type: Schema.Types.ObjectId, ref: "User" },
  ratedTo: { type: Schema.Types.ObjectId, ref: "Feedback" },
  number: { type: Number, required: true, min: 1, max: 5 },
});

const Rating =
  (mongoose.models.Rating as mongoose.Model<IRating>) ||
  mongoose.model<IRating>("Rating", RatingSchema);

export default Rating;
