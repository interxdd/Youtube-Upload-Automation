const mongoose = require('mongoose');

async function connectMongo() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/yr';
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });
  console.log('MongoDB connected');
}

module.exports = { connectMongo };


