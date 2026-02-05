import multer from 'multer';
import path from 'path';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../config/constants.js';

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    cb(null, `profile-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|webp/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new ApiError(HTTP_STATUS.BAD_REQUEST, 'Error: Images only! (jpeg, jpg, png, webp)'));
  }
}

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 }, // 2MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;
