import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";
import { promisify } from "util";

const unlinkFile = promisify(fs.unlink);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (
  localFilePath: string
): Promise<UploadApiResponse | null> => {
  try {
    if (!localFilePath) return null;

    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });

    await unlinkFile(localFilePath);

    return uploadResult;
  } catch (error) {
    await unlinkFile(localFilePath);
    console.error("Error occurred while uploading file on Cloudinary: ", error);
    return null;
  }
};

export const deleteFromCloudinary = async (url: string): Promise<void> => {
  try {
    const publicId = url.split("/").pop()?.split(".")[0];
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    }
  } catch (error) {
    console.error(
      "Error occurred while deleting file from Cloudinary: ",
      error
    );
  }
};
