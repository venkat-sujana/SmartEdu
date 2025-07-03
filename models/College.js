import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
},
  code: { 
    type: String, 
    required: true, 
    unique: true 
}, // Example: "GJC-123"
  address: String,
  district: String,
  principalName: String,
  contactEmail: String,
  contactPhone: String,
}, { timestamps: true });

const College = mongoose.models.College || mongoose.model("College", collegeSchema);
export default College;
