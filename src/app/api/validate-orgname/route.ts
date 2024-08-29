import dbConnect from "@/lib/dbConnect";
import Org from "@/models/organization.model";
import User from "@/models/user.model";
import { apiError, apiResponse } from "@/utils/response.util";
import { usernameValidation } from "@/validations/signup.validation";
import { NextRequest } from "next/server";
import { z } from "zod";

const OrgNameQueryValidation = z.object({
  orgName: usernameValidation,
});

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const orgNameQueryParam = new URLSearchParams(req.url).get("orgname");
    const decodedOrgNameQueryParam = decodeURIComponent(
      orgNameQueryParam || ""
    );

    const result = OrgNameQueryValidation.safeParse({
      decodedOrgNameQueryParam,
    });

    if (!result.success) {
      return apiError(
        400,
        "Invalid query parameters",
        result.error.format().orgName?._errors[0]
      );
    }

    const { orgName } = result.data;

    const existingVerifierOrg = await Org.findOne({
      organizationName: orgName,
      isVerified: true,
    });

    const existingVerifiedUser = await User.findOne({
      username: orgName,
      isVerified: true,
    });

    if (existingVerifierOrg || existingVerifiedUser) {
      return apiError(400, "Organization name is already taken");
    }

    return apiResponse(200, "Organization name is available");
  } catch (error) {
    return apiError(500, "Internal Server Error", error);
  }
}
