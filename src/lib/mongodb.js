// src/lib/mongodb.js

import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null
  };
}

async function connectMongoDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const options = {
      bufferCommands: false,
      maxPoolSize: 10
    };

    cached.promise = mongoose.connect(MONGODB_URI, options);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectMongoDB;
