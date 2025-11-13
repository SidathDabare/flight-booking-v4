import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    orders: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    },
  },
  { timestamps: true }
);

const Customer =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);

export default Customer;
