const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeJob, uploadImage } = require('../controllers/analyzeController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only images and PDFs are allowed'));
  }
});

router.post('/analyze-job', analyzeJob);
router.post('/upload-image', upload.single('file'), uploadImage);

module.exports = router;
