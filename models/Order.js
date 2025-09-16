// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema(
//   {
//     customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
//     amount: { type: Number, required: true },
//     date: { type: Date, required: true }
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Order", orderSchema);
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
