const express = require('express');
const { google } = require('googleapis');
const User = require('../models/User');

const router = express.Router();

function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

router.get('/google', (req, res) => {
  const oauth2Client = createOAuthClient();
  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const oauth2Client = createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const me = await oauth2.userinfo.get();
    const { email, id, name, picture } = me.data;

    let user = await User.findOne({ googleId: id });
    if (!user) user = new User({ googleId: id });
    user.email = email;
    user.displayName = name;
    user.photoUrl = picture;
    user.tokens = tokens;
    await user.save();

    const redirect = req.query.redirect;
    if (redirect) {
      const url = new URL(redirect);
      url.searchParams.set('userId', String(user._id));
      res.redirect(url.toString());
      return;
    }

    res.json({ ok: true, user: { id: user._id, email: user.email, name: user.displayName } });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;


