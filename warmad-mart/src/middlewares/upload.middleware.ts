
import type { Request } from "express";
import multer from "multer";
import path from "path";

// Simpan file di memori sebagai Buffer
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png"];

// Filter file hanya untuk gambar JPG dan PNG
function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  const ext = path.extname(file.originalname).toLowerCase();

  const isMimeValid = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

  if (isMimeValid && isExtValid) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file JPG dan PNG yang diperbolehkan!"));
  }
}


export const uploadSingleImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal 5 MB
  },
}).single("imageUrl");


// Tipe Request yang mendukung file upload Multer
export type MulterRequest = Request & {
  file?: Express.Multer.File;
  files?:
    | Express.Multer.File[]
    | Record<string, Express.Multer.File[]>;
};
