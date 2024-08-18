import dbConnect from "@/lib/dbConnect";
import { apiError, apiResponse } from "@/utils/response.util";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { username, email, password } = await req.json();

    return apiResponse(200, {});
  } catch (error) {
    console.log("Error registering user:", error);
    return apiError(500, "An error occured while registering the user", error);
  }
}
