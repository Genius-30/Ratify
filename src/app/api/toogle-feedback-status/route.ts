import dbConnect from "@/lib/dbConnect";
import { NextRequest } from "next/server";
import { apiError, apiResponse } from "@/utils/response.util";
import { auth } from "../auth/[...nextauth]/options";
import Feedback from "@/models/feedback.model";

export async function POST(req: NextRequest) {
  await dbConnect();

  const session = await auth();

  if (!session || !session.user) {
    return apiError(401, "Unauthorized");
  }

  const userId = session.user._id;

  const { feedbackId, status } = await req.json();

  try {
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return apiError(404, "Feedback not found");
    }

    if (feedback.taker.toString() !== userId) {
      return apiError(403, "Forbidden");
    }

    if (!status) {
      return apiError(400, "Status is required");
    }

    feedback.status = status;
    await feedback.save();

    return apiResponse(200, { message: "Feedback status updated" });
  } catch (error) {
    console.error(error);
    return apiError(
      500,
      "Internal Server Error || Failed to update feedback status"
    );
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();

  const session = await auth();

  if (!session || !session.user) {
    return apiError(401, "Unauthorized");
  }

  const { feedbackId } = await req.json();

  try {
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return apiError(404, "Feedback not found");
    }

    return apiResponse(200, { feedbackStatus: feedback.status });
  } catch (error) {
    console.error(error);
    return apiError(
      500,
      "Internal Server Error || Failed to fetch feedback status"
    );
  }
}
