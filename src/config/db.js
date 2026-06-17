const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
}

module.exports = { connectDB };
