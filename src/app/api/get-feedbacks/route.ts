import dbConnect from "@/lib/dbConnect";
import { NextRequest } from "next/server";
import { apiError, apiResponse } from "@/utils/response.util";
import Feedback from "@/models/feedback.model";

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const usernameQueryParam = new URLSearchParams(req.url).get("username");
    const decodedUsernameQueryParam = decodeURIComponent(
      usernameQueryParam || ""
    );

    let feedbacks;
    if (decodedUsernameQueryParam) {
      feedbacks = await Feedback.find({
        username: decodedUsernameQueryParam,
      })
        .populate("giver", "username")
        .populate("taker", "organizationName");
    } else {
      feedbacks = await Feedback.find({})
        .populate("giver", "username")
        .populate("taker", "organizationName");
    }

    if (!feedbacks) {
      return apiError(404, "No feedbacks found");
    }

    return apiResponse(200, feedbacks);
  } catch (error) {
    return apiError(500, "Internal Server Error", error);
  }
}
