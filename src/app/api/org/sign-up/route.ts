import dbConnect from "@/lib/dbConnect";
import Org from "@/models/organization.model";
import User from "@/models/user.model";
import { UserRole } from "@/types/enums";
import { uploadOnCloudinary } from "@/utils/cloudinary.util";
import { apiError, apiResponse } from "@/utils/response.util";
import sendVerificationEmail from "@/utils/sendVerificationEmail";
import { writeFile } from "fs/promises";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    //email, password, avatar, verifyCode, verifyCodeExpiry, isVerified, role, organizationName, organizationBio, industry, topExecutives, links, images
    const formData = await req.formData();
    console.log("formData", formData);

    const timestamp = Date.now();

    const avatar = formData.get("avatar") as File;
    const orgMedia = formData.getAll("orgMedia") as File[];

    let avatarUrl: string | undefined;
    if (avatar instanceof File) {
      const avatarByteData = await avatar.arrayBuffer();
      const buffer = Buffer.from(avatarByteData);
      const avatarPath = `/public/uploads/${timestamp}-${avatar.name}`;

      const fullAvatarPath = `${process.cwd()}${avatarPath}`;
      await writeFile(fullAvatarPath, buffer);

      const avatarUploadResult = await uploadOnCloudinary(fullAvatarPath);
      if (!avatarUploadResult) {
        return apiError(500, "Failed to upload avatar to Cloudinary");
      }
      avatarUrl = avatarUploadResult.url;
    } else {
      return apiError(400, "Avatar is required!");
    }

    let orgMediaUrls: string[] = [];
    if (orgMedia.length > 0) {
      for (const file of orgMedia) {
        const mediaByteData = await file.arrayBuffer();
        const buffer = Buffer.from(mediaByteData);
        const mediaPath = `/public/uploads/${Date.now()}-${file.name}`;
        const fullMediaPath = `${process.cwd()}${mediaPath}`;
        await writeFile(fullMediaPath, buffer);

        const mediaUploadResult = await uploadOnCloudinary(fullMediaPath);
        if (!mediaUploadResult) {
          return apiError(500, `Failed to upload media to Cloudinary`);
        }
        orgMediaUrls.push(mediaUploadResult.url);
      }
    }

    const organizationName = formData.get("organizationName") as string;
    const organizationBio = formData.get("organizationBio") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const industry = formData.get("industry") as string;
    const topExecutives = formData.get("topExecutives") as string;
    const links = formData.getAll("links") as string[];

    if (
      !(
        organizationName &&
        organizationBio &&
        email &&
        password &&
        industry &&
        topExecutives
      )
    ) {
      return apiError(400, "Please fill all required fields");
    }

    const existingVerifiedOrgByName = await Org.findOne({
      organizationName,
      isVerified: true,
    });

    if (existingVerifiedOrgByName) {
      return apiError(400, "Organization already exists");
    }

    const isOrgNameAlreadyTakenedByUser = await User.findOne({
      username: organizationName.trim().toLowerCase(),
      isVerified: true,
    });

    if (isOrgNameAlreadyTakenedByUser) {
      return apiError(400, "Organization name already taken by a user");
    }

    const existingOrgByEmail = await Org.findOne({ email });
    const existingUserByEmail = await User.findOne({ email });

    if (existingUserByEmail?.isVerified) {
      return apiError(400, "User already exists.");
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    if (existingOrgByEmail) {
      if (existingOrgByEmail.isVerified) {
        return apiError(400, "Organization already exists.");
      } else {
        existingOrgByEmail.organizationName = organizationName;
        existingOrgByEmail.organizationBio = organizationBio;
        existingOrgByEmail.avatar = avatarUrl;
        existingOrgByEmail.orgMedia = orgMediaUrls;
        existingOrgByEmail.password = password;
        existingOrgByEmail.industry = industry;
        existingOrgByEmail.topExecutives = topExecutives;
        existingOrgByEmail.links = links;
        existingOrgByEmail.verifyCode = verifyCode;
        existingOrgByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        existingOrgByEmail.role = UserRole.ORG;

        await existingOrgByEmail.save();
      }
    } else {
      const org = new Org({
        avatar: avatarUrl,
        organizationName,
        organizationBio,
        email,
        password,
        industry,
        topExecutives,
        links,
        orgMedia: orgMediaUrls,
        verifyCode,
        verifyCodeExpiry,
        isVerified: false,
        role: UserRole.ORG,
      });
      await org.save();
    }

    const emailResponse = await sendVerificationEmail(
      email,
      organizationName,
      verifyCode
    );

    if (!emailResponse.success) {
      return apiError(500, emailResponse.message);
    }

    return apiResponse(200, {
      message:
        organizationName +
        " has been created successfully. Please check your email for verification link.",
    });
  } catch (error) {
    console.log("Error registering organization:", error);
    return apiError(
      500,
      "An error occured while registering the organization",
      error
    );
  }
}
