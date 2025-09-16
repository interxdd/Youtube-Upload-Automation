const { agenda } = require('./agenda');
const Video = require('../models/Video');
const User = require('../models/User');
const { getOAuthClientForUser, uploadToYouTube } = require('../jobs/uploader');

function registerJobs() {
  agenda.define('upload-due-videos', async (job, done) => {
    try {
      const now = new Date();
      const dueVideos = await Video.find({ status: { $in: ['pending', 'queued'] }, scheduledDate: { $lte: now } })
        .sort({ scheduledDate: 1 })
        .limit(5);

      for (const video of dueVideos) {
        video.status = 'uploading';
        await video.save();
        try {
          const user = await User.findById(video.user);
          if (!user || !user.tokens || !user.tokens.refresh_token) throw new Error('Missing user tokens');
          const oauth = await getOAuthClientForUser(user);
          const videoId = await uploadToYouTube(oauth, video);
          video.youtubeVideoId = videoId;
          video.status = 'success';
          await video.save();
        } catch (e) {
          video.status = 'failed';
          video.error = e.message;
          await video.save();
        }
      }
      done();
    } catch (err) {
      done(err);
    }
  });

  agenda.every('1 minute', 'upload-due-videos');
}

module.exports = { registerJobs };


