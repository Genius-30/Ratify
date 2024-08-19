import dbConnect from "@/lib/dbConnect";
import { uploadAvatar, uploadOrgImages } from "@/middlewares/multer.middleware";
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
    //email, password, avatar, verifyCode, verifyCodeExpiry, isVerified, role, organizationName, organizationBio, industry, topExecutives, links, images
    const {
      organizationName,
      organizationBio,
      email,
      password,
      industry,
      topExecutives,
      links,
    } = await req.json();

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
      return apiError(400, "Organization with this name already exists");
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

    await new Promise<void>((resolve, reject) => {
      uploadAvatar(req as any, {} as any, (err: any) =>
        err ? reject(err) : resolve()
      );
    });

    await new Promise<void>((resolve, reject) => {
      uploadOrgImages(req as any, {} as any, (err: any) =>
        err ? reject(err) : resolve()
      );
    });

    const orgAvatar = (req as any).file;
    const orgMedia = (req as any).files || [];

    let orgAvatarCloudinaryUrl;
    if (!orgAvatar) {
      return apiError(400, "Please upload an avatar");
    } else {
      orgAvatarCloudinaryUrl = await uploadOnCloudinary(orgAvatar.path);
      if (!orgAvatarCloudinaryUrl) {
        return apiError(500, "Failed to upload avatar to Cloudinary");
      }
    }

    let orgMediaCloudinaryUrls = [];
    if (orgMedia.length > 0) {
      orgMediaCloudinaryUrls = await Promise.all(
        orgMedia.map(async (image: any) => {
          const uploadResult = await uploadOnCloudinary(image.path);
          if (!uploadResult) {
            return apiError(500, "Failed to upload avatar to Cloudinary");
          }
        })
      );
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingOrgByEmail) {
      if (existingOrgByEmail.isVerified) {
        return apiError(400, "Organization already exists.");
      } else {
        existingOrgByEmail.organizationName = organizationName;
        existingOrgByEmail.organizationBio = organizationBio;
        existingOrgByEmail.avatar = orgAvatarCloudinaryUrl?.url;
        existingOrgByEmail.images = orgMediaCloudinaryUrls.map(
          (url: any) => url.url
        );
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
        avatar: orgAvatarCloudinaryUrl?.url,
        organizationName,
        organizationBio,
        email,
        password,
        industry,
        topExecutives,
        links,
        images: orgMediaCloudinaryUrls.map((url: any) => url.url),
        verifyCodeExpiry: new Date(Date.now() + 3600000),
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
