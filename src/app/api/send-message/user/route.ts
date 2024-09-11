import dbConnect from "@/lib/dbConnect";
import { NextRequest } from "next/server";
import { apiError, apiResponse } from "@/utils/response.util";
import { auth } from "../../auth/[...nextauth]/options";
import Discussion from "@/models/discussion.model";
import { ParticipantType } from "@/models/discussion.model";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const session = await auth();
    if (!session) {
      return apiError(401, "Unauthorized");
    }

    const { user } = session;
    const { content, feedbackId, receiverId, receiverType } = await req.json();

    if (!(content && receiverId && receiverType && feedbackId)) {
      return apiError(400, "Bad Request: Missing required fields");
    }

    const newDiscussion = new Discussion({
      sender: {
        id: user._id,
        type: ParticipantType.User,
      },
      receiver: {
        id: receiverId,
        type: receiverType,
      },
      feedbackId,
      content,
    });

    await newDiscussion.save();

    return apiResponse(201, "Discussion created successfully");
  } catch (error) {
    return apiError(500, "Internal Server Error", error);
  }
}
