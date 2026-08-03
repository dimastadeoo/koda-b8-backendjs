import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tentukan folder upload
const uploadDir = path.join(__dirname, '../../uploads/profiles');

// Buat folder jika belum ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Buat nama file unik: userId-timestamp.ext
    const userId = req.user?.userId || Date.now();
    const ext = path.extname(file.originalname);
    const uniqueName = `${userId}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

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

// Limit ukuran: 5MB
const limits = { fileSize: 5 * 1024 * 1024 };

const upload = multer({ storage, fileFilter, limits });

// Middleware untuk single file dengan field name "picture"
export const uploadProfilePicture = upload.single('picture');