// src/lib/uploads.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base upload directory: /uploads
const baseUploadDir = path.join(__dirname, '../../uploads');

// Pastikan folder base upload ada
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Fungsi untuk membuat storage dinamis berdasarkan subfolder
const createStorage = (subfolder) => {
  const uploadDir = path.join(baseUploadDir, subfolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Format: fieldname-timestamp.ext (untuk menghindari duplikasi)
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const uniqueName = `${baseName}-${Date.now()}${ext}`;
      cb(null, uniqueName);
    }
  });
};

// Filter file: hanya gambar
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan (jpeg, jpg, png, gif, webp)'));
  }
};

const limits = { fileSize: 2 * 1024 * 1024 }; // 2MB

// Middleware untuk upload profile picture (single file)
export const uploadProfilePicture = (req, res, next) => {
  const storage = createStorage('profiles');
  const upload = multer({ storage, fileFilter, limits }).single('picture');
  upload(req, res, next);
};

// Middleware untuk upload product images (multiple files)
export const uploadProductImages = (req, res, next) => {
  const storage = createStorage('products');
  const upload = multer({ storage, fileFilter, limits }).array('images', 10); // max 10 images
  upload(req, res, next);
};

// Fungsi untuk menghapus file dari disk
export const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(baseUploadDir, filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// Fungsi untuk mendapatkan path relatif dari base upload
export const getUploadPath = (subfolder, filename) => {
  return `${subfolder}/${filename}`;
};