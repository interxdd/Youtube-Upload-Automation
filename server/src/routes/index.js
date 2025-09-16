const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

router.use('/oauth2', require('./auth'));
router.use('/videos', require('./videos'));

module.exports = router;


