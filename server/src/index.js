const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { connectMongo } = require('./lib/mongo');
const { agenda } = require('./lib/agenda');
const { registerJobs } = require('./lib/registerJobs');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

app.use('/api', routes);

const port = process.env.PORT || 4000;

async function start() {
  await connectMongo();
  registerJobs();
  await agenda.start();
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});


