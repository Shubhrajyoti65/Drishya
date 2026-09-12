import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    const stats = fs.statSync(localFilePath);
    let response;

    if (stats.size > 100000000) {
      response = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(
          localFilePath,
          {
            resource_type: "auto",
            chunk_size: 6000000,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
      });
    } else {
      response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      });
    }

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return response;
  } catch (error) {
    console.error("Upload failed details:", error);

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};
export { uploadOnCloudinary };

