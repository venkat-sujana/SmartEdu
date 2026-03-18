//app/models/College.js
import mongoose from "mongoose";
import { DEFAULT_COLLEGE_GROUPS, ensureCollegeGroups } from "@/utils/collegeGroups";

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
  contactEmail: String,
  contactPhone: String,
  groups: {
    type: [String],
    default: DEFAULT_COLLEGE_GROUPS,
    set: ensureCollegeGroups,
  },
}, { timestamps: true });

const College = mongoose.models.College || mongoose.model("College", collegeSchema);
export default College;

