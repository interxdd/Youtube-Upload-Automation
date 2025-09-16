## Scheduled YouTube Uploader (Backend)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` in `server/` with:
```bash
PORT=4000
MONGODB_URI=mongodb://localhost:27017/yr

GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:4000/api/oauth2/callback

YOUTUBE_PRIVACY_STATUS=private
TIMEZONE=Europe/Istanbul
```

3. Start server:
```bash
npm run dev
```

### API

- `GET /api/health` – health check
- `GET /api/oauth2/google` – start Google OAuth
- `GET /api/oauth2/callback` – OAuth callback; returns user info and stores tokens
- `POST /api/videos/batch` – multipart form with fields:
  - `videos`: multiple video files
  - `thumbnails`: multiple image files (optional)
  - `metadata`: JSON array matching videos order, items: `{ title, description, scheduledDate, privacyStatus, thumbnailIndex }`
  - header `x-user-id`: your MongoDB user id (replace later with real auth)
- `GET /api/videos?userId=...&status=...` – list videos
- `GET /api/videos/:id` – get one

### Scheduler

Agenda job `upload-due-videos` runs every minute, uploads videos whose `scheduledDate` <= now, using stored OAuth tokens.


