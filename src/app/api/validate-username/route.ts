import dbConnect from "@/lib/dbConnect";
import Org from "@/models/organization.model";
import User from "@/models/user.model";
import { apiError, apiResponse } from "@/utils/response.util";
import { usernameValidation } from "@/validations/signup.validation";
import { NextRequest } from "next/server";
import { z } from "zod";

const UsernameQueryValidation = z.object({
  username: usernameValidation,
});

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const usernameQueryParam = new URLSearchParams(req.url).get("username");
    const decodedUsernameQueryParam = decodeURIComponent(
      usernameQueryParam || ""
    );

    const result = UsernameQueryValidation.safeParse({
      decodedUsernameQueryParam,
    });

    if (!result.success) {
      return apiError(
        400,
        "Invalid query parameters",
        result.error.format().username?._errors[0]
      );
    }

    const { username } = result.data;

    const existingVerifierUser = await User.findOne({
      username,
      isVerified: true,
    });

    const existingOrg = await Org.findOne({
      organizationName: username,
    });

    if (existingVerifierUser || existingOrg) {
      return apiError(400, "Username is already taken");
    }

    return apiResponse(200, "Username is available");
  } catch (error) {
    return apiError(500, "Internal Server Error", error);
  }
}
