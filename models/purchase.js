import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
  email: String,
  payment_id: String,
  razorpay_order_id: String,
  files: [
    {
      id: String,
      name: String,
    },
  ],
  amount: Number,
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite in dev/ serverless reloads
const Purchase =
  mongoose.models.Purchase || mongoose.model("Purchase", purchaseSchema);

export default Purchase;
