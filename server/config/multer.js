import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary, { hasCloudinaryConfig } from "./config.js";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const createStorage = () => {
  if (!hasCloudinaryConfig) {
    return multer.memoryStorage();
  }

  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "silentConnection",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
    },
  });
};

const imageFileFilter = (req, file, cb) => {
  if (allowedImageTypes.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("Only JPG, PNG and WEBP images are allowed"));
};

const createImageUpload = ({ fileSize }) =>
  multer({
    storage: createStorage(),
    fileFilter: imageFileFilter,
    limits: {
      fileSize,
      files: 1,
    },
  });

const upload = createImageUpload({ fileSize: 5 * 1024 * 1024 });
const profileImageUpload = createImageUpload({ fileSize: 2 * 1024 * 1024 });

export default upload;
export { profileImageUpload };
