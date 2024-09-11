import dbConnect from "@/lib/dbConnect";
import { NextRequest } from "next/server";
import { apiError, apiResponse } from "@/utils/response.util";
import Feedback from "@/models/feedback.model";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { feedbackId, title, content, status } = await req.json();

    if (!feedbackId) {
      return apiError(400, "Feedback ID is required");
    }

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return apiError(404, "Feedback not found");
    }

    if (title) feedback.title = title;
    if (content) feedback.content = content;
    if (status) feedback.status = status;
    await feedback.save();

    return apiResponse(200, { message: "Feedback updated successfully" });
  } catch (error) {
    return apiError(500, "Internal Server Error", error);
  }
}
