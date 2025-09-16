import mongoose from "mongoose";

const CommunicationLogSchema = new mongoose.Schema({
  campaignId: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  message: String,
  rules: Object,
  status: { type: String, enum: ["SENT", "FAILED"], default: "SENT" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("CommunicationLog", CommunicationLogSchema);
