import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
  },
  { _id: false },
);

const paymentDetailsSchema = new mongoose.Schema(
  {
    stripePaymentIntentId: String,
    // stripeChargeId: String,
    method: String,
    amount: Number,
    currency: String,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    items: [orderItemSchema],

    pricing: {
      subTotal: Number,
      shipping: Number,
      discount: Number,
      total: Number,
    },

    coupon: {
      type: mongoose.Schema.Types.String,
      default: null,
      ref: "coupon",
    },

    shippingAddress: {
      fullName: String,
      phone: String,
      email: String,
      address: String,
      city: String,
      country: String,
      postalCode: String,
    },
    shippingMethod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingMethod",
    },

    status: {
      type: String,
      enum: [
        "pending_payment",
        "paid",
        "payment_failed",
        "cancelled",
        "processing",
        "shipped",
        "delivered",
        "refunded",
        "expired",
      ],
      default: "pending_payment",
    },

    paymentIntentId: {
      type: String,
      index: true,
    },

    paymentDetails: paymentDetailsSchema,

    // stockReserved: {
    //   type: Boolean,
    //   default: false,
    // },

    // expiresAt: {
    //   type: Date, // for auto-cancel unpaid orders
    //   index: true,
    // },

    paidAt: Date,
    cancelledAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true },
);
const Order = mongoose.model("Order", orderSchema);
export default Order;
