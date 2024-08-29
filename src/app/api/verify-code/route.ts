import dbConnect from "@/lib/dbConnect";
import Org from "@/models/organization.model";
import User from "@/models/user.model";
import { apiError, apiResponse } from "@/utils/response.util";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const orgName = searchParams.get("orgName");
    const identifier = username || orgName;
    const { code } = await req.json();

    if (!identifier && !code) {
      return apiError(400, "Invalid credentials");
    }

    let user = username
      ? await User.findOne({ username })
      : await Org.findOne({ organizationName: orgName });

    if (!user) {
      return apiError(404, "User not found");
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeExpired = new Date() > user.verifyCodeExpiry;

    if (!isCodeValid) {
      return apiError(401, "Invalid code");
    } else if (isCodeExpired) {
      return apiError(401, "Code has expired");
    }

    user.isVerified = true;
    await user.save();

    return apiResponse(200, "User verified successfully");
  } catch (error) {
    return apiError(500, "Internal Server Error", error);
  }
}
