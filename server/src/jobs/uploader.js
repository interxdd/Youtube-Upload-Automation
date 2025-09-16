const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const dayjs = require('dayjs');
const Video = require('../models/Video');
const User = require('../models/User');

async function getOAuthClientForUser(user) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  client.setCredentials(user.tokens);
  return client;
}

async function uploadToYouTube(oauth2Client, videoDoc) {
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const filePath = path.resolve(videoDoc.filePath);
  if (!fs.existsSync(filePath)) throw new Error('Video file missing');

  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: videoDoc.title,
        description: videoDoc.description,
      },
      status: {
        privacyStatus: videoDoc.privacyStatus || 'private',
        publishAt: videoDoc.privacyStatus === 'public' ? undefined : videoDoc.scheduledDate,
      },
    },
    media: {
      body: fs.createReadStream(filePath),
    },
  });

  const videoId = res.data.id;

  if (videoDoc.thumbnailPath && fs.existsSync(videoDoc.thumbnailPath)) {
    try {
      await youtube.thumbnails.set({
        videoId,
        media: { body: fs.createReadStream(videoDoc.thumbnailPath) },
      });
    } catch (e) {
      // do not fail job solely due to thumbnail
      console.warn('Thumbnail upload failed', e.message);
    }
  }

  return videoId;
}

module.exports = { getOAuthClientForUser, uploadToYouTube };


