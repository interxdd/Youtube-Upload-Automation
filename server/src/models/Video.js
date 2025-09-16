const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    filePath: { type: String, required: true },
    thumbnailPath: { type: String },
    scheduledDate: { type: Date, required: true, index: true },
    status: { type: String, enum: ['pending', 'queued', 'uploading', 'success', 'failed'], default: 'pending' },
    youtubeVideoId: { type: String },
    privacyStatus: { type: String, enum: ['private', 'unlisted', 'public'], default: process.env.YOUTUBE_PRIVACY_STATUS || 'private' },
    error: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Video', videoSchema);


