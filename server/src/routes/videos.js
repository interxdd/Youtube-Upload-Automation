const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
const Video = require('../models/Video');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.mp4', '.mov', '.avi', '.mkv', '.jpg', '.jpeg', '.png', '.webp'];
  if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
  else cb(new Error('Invalid file type'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 1024 * 1024 * 1024 } });

// In a full app, req.user would be set after OAuth. For now, accept userId header.
router.post('/batch', upload.fields([{ name: 'videos', maxCount: 50 }, { name: 'thumbnails', maxCount: 50 }]), async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized: missing x-user-id' });

    const { metadata } = req.body; // JSON array mapping index -> {title, description, scheduledDate, thumbnailIndex, privacyStatus}
    const parsed = JSON.parse(metadata || '[]');
    const created = [];

    const videoFiles = (req.files && req.files.videos) || [];
    const thumbnailFiles = (req.files && req.files.thumbnails) || [];

    for (let i = 0; i < videoFiles.length; i += 1) {
      const file = videoFiles[i];
      const meta = parsed[i] || {};
      const scheduledDate = meta.scheduledDate ? new Date(meta.scheduledDate) : new Date();
      const thumbFile = typeof meta.thumbnailIndex === 'number' ? thumbnailFiles[meta.thumbnailIndex] : undefined;

      const videoDoc = await Video.create({
        user: userId,
        title: meta.title || path.basename(file.originalname, path.extname(file.originalname)),
        description: meta.description || '',
        filePath: file.path,
        thumbnailPath: thumbFile ? thumbFile.path : undefined,
        scheduledDate,
        privacyStatus: meta.privacyStatus || process.env.YOUTUBE_PRIVACY_STATUS || 'private',
        status: 'pending',
      });
      created.push(videoDoc);
    }

    res.json({ ok: true, count: created.length, videos: created });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// List videos for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized: missing userId' });
    const status = req.query.status;
    const q = { user: userId };
    if (status) q.status = status;
    const docs = await Video.find(q).sort({ scheduledDate: 1 }).lean();
    res.json({ ok: true, count: docs.length, videos: docs });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get single video
router.get('/:id', async (req, res) => {
  try {
    const doc = await Video.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, video: doc });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;


