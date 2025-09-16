const Agenda = require('agenda');

const agenda = new Agenda({
  db: { address: process.env.MONGODB_URI || 'mongodb://localhost:27017/yr', collection: 'agendaJobs' },
  processEvery: '30 seconds',
  maxConcurrency: 2,
});

module.exports = { agenda };


