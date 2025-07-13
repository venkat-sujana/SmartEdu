//app/models/PrincipalModel.js
// This file defines the Mongoose schema and model for the Principal entity.

import mongoose from "mongoose";

const principalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    photo: {
      type: String, // Cloudinary URL or base64 string
      required: false, // optional field
    },
  },
  {
    timestamps: true,
  }
);

export const Principal =
  mongoose.models.Principal || mongoose.model("Principal", principalSchema);
