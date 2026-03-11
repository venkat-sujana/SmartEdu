import mongoose from "mongoose"

const AuditLogSchema = new mongoose.Schema({

 userId:String,
 action:String,
 entity:String,
 createdAt:{
  type:Date,
  default:Date.now
 }

})

export default mongoose.models.AuditLog ||
 mongoose.model("AuditLog",AuditLogSchema)