import dbConnect from "@/lib/dbConnect";
import { NextRequest } from "next/server";
import { apiError, apiResponse } from "@/utils/response.util";
import Feedback from "@/models/feedback.model";
import { auth } from "../auth/[...nextauth]/options";
import Rating from "@/models/rating.model";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const session = await auth();
    if (!session) {
      return apiError(401, "Unauthorized");
    }

    const { user } = session;

    const { feedbackId, number } = await req.json();

    if (!(feedbackId && number && number >= 1 && number <= 5)) {
      return apiError(400, "Invalid request body");
    }

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return apiError(404, "Feedback not found");
    }

    await Rating.create({
      ratedBy: user._id,
      ratedTo: feedback._id,
      number,
    });

    return apiResponse(201, "Rated successfully");
  } catch (error: any) {
    return apiError(500, "Internal Server Error", error.message);
  }
}
