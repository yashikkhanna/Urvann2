import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plant",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity cannot be less than 1"],
      default: 1,
    },
    priceAtTime: {
      type: Number,
      required: true, // snapshot of plant price
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ✅ 1 cart per user
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// 🔹 Helper method to recalc total
cartSchema.methods.calculateTotal = function () {
  this.totalPrice = this.items.reduce(
    (acc, item) => acc + item.quantity * item.priceAtTime,
    0
  );
  return this.totalPrice;
};

export const Cart = mongoose.model("Cart", cartSchema);
