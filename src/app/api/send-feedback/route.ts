import dbConnect from "@/lib/dbConnect";
import { NextRequest } from "next/server";
import { apiError, apiResponse } from "@/utils/response.util";
import Feedback from "@/models/feedback.model";
import { auth } from "../auth/[...nextauth]/options";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const session = await auth();
    if (!session) {
      return apiError(401, "Unauthorized");
    }

    const { user } = session;

    const { taker, title, content, status } = await req.json();

    if (!(taker && title && content && status)) {
      return apiError(400, "All fields are required!");
    }

    const feedback = new Feedback({
      giver: user._id,
      taker,
      title,
      content,
      status,
    });
    await feedback.save();

    return apiResponse(200, "Feedback sent successfully");
  } catch (error) {
    return apiError(500, "Internal Server Error", error);
  }
}
