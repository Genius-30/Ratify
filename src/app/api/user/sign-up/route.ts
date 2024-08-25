import { NextRequest } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Org from "@/models/organization.model";
import User from "@/models/user.model";
import { UserRole } from "@/types/enums";
import { uploadOnCloudinary } from "@/utils/cloudinary.util";
import { apiError, apiResponse } from "@/utils/response.util";
import sendVerificationEmail from "@/utils/sendVerificationEmail";
import { writeFile } from "fs/promises";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const formData = await req.formData();
    const timestamp = Date.now();

    const avatar = formData.get("avatar") as File;
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

    const fullName = formData.get("fullName") as string;
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!(fullName && username && email && password)) {
      return apiError(400, "Please fill all fields");
    }

    const existingVerifiedUserByUsername = await User.findOne({
      username,
      isVerified: true,
    });
    if (existingVerifiedUserByUsername) {
      return apiError(400, "Username already taken!");
    }

    const isUsernameIsOrganizationName = await Org.findOne({
      organizationName: username.trim().toLowerCase(),
    });
    if (isUsernameIsOrganizationName) {
      return apiError(
        400,
        "Username can't be the same as an organization name!"
      );
    }

    const existingUserByEmail = await User.findOne({ email });
    const existingOrgByEmail = await Org.findOne({ email });

    if (existingOrgByEmail) {
      return apiError(400, "User already exists.");
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return apiError(400, "User already exists.");
      } else {
        existingUserByEmail.username = username;
        existingUserByEmail.fullName = fullName;
        existingUserByEmail.avatar = avatarUrl;
        existingUserByEmail.password = password;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = verifyCodeExpiry;
        existingUserByEmail.role = UserRole.USER;
        await existingUserByEmail.save();
      }
    } else {
      const user = new User({
        username,
        fullName,
        email,
        avatar: avatarUrl,
        password,
        verifyCode,
        verifyCodeExpiry,
        role: UserRole.USER,
      });
      await user.save();
    }

    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success) {
      return apiError(500, emailResponse.message);
    }

    return apiResponse(200, {
      message: "User registered successfully! Verify your email now.",
    });
  } catch (error) {
    console.log("Error registering user:", error);
    return apiError(500, "An error occurred while registering the user", error);
  }
}
