import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    totalSpend: { type: Number, default: 0 },
    visits: { type: Number, default: 0 },
    lastActiveAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
