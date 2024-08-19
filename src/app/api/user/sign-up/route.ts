import dbConnect from "@/lib/dbConnect";
import { uploadAvatar } from "@/middlewares/multer.middleware";
import Org from "@/models/organization.model";
import User from "@/models/user.model";
import { UserRole } from "@/types/enums";
import { uploadOnCloudinary } from "@/utils/cloudinary.util";
import { apiError, apiResponse } from "@/utils/response.util";
import sendVerificationEmail from "@/utils/sendVerificationEmail";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest, res: NextResponse) {
  await dbConnect();

  try {
    //username, fullName, email, password, avatar, verifyCode, verifyCodeExpiry, isVerified, role
    const { fullName, username, email, password } = await req.json();

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
        "Username cant be the same as an organization name!"
      );
    }

    const existingUserByEmail = await User.findOne({ email });
    const existingOrgByEmail = await Org.findOne({ email });

    if (existingOrgByEmail) {
      return apiError(400, "User already exists.");
    }

    await new Promise<void>((resolve, reject) => {
      uploadAvatar(req as any, {} as any, (err: any) =>
        err ? reject(err) : resolve()
      );
    });

    const avatar = (req as any).file;

    let uploadResult;
    if (avatar) {
      uploadResult = await uploadOnCloudinary(avatar.path);
      if (!uploadResult) {
        return apiError(500, "Failed to upload avatar to Cloudinary");
      }
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return apiError(400, "User already exists.");
      } else {
        existingUserByEmail.username = username;
        existingUserByEmail.fullName = fullName;
        existingUserByEmail.avatar = uploadResult?.url;
        existingUserByEmail.password = password;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        existingUserByEmail.role = UserRole.USER;

        await existingUserByEmail.save();
      }
    } else {
      const user = new User({
        username,
        fullName,
        email,
        avatar: uploadResult?.url,
        password,
        verifyCode,
        verifyCodeExpiry: new Date(Date.now() + 3600000),
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
      message: "User registered successfully! Verify you email now.",
    });
  } catch (error) {
    console.log("Error registering user:", error);
    return apiError(500, "An error occured while registering the user", error);
  }
}
