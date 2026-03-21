import mongoose from "mongoose";

export const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    category: {
      type: [String],
      required: true,
      ref: "category",
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    colors: {
      type: [
        {
          colorName: String,
          colorCode: String,
          images: [String],
        },
      ],
      default: [],
    },
    sizes: {
      type: [
        {
          type: String,
          enum: ["XS", "S", "M", "L", "XL", "XXL"],
        },
      ],
      default: [],
    },
    weight: {
      type: {
        value: Number,
        uint: {
          type: String,
          enum: ["MG", "G", "KG"],
        },
      },
      default: null,
    },
    dimensions: {
      length: {
        type: Number,
        enum: ["MM", "CM", "M"],
        default: null,
      },
      width: {
        type: Number,
        enum: ["MM", "CM", "M"],
        default: null,
      },
      height: {
        type: Number,
        enum: ["MM", "CM", "M"],
        default: null,
      },
      depth: {
        type: Number,
        enum: ["MM", "CM", "M"],
        default: null,
      },
    },
    versions: {
      type: [
        {
          version: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
          versionName: String,
        },
      ],
      default: [],
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    __v: {
      type: Number,
      select: false,
    },
  },
  { timestamps: true },
);

const product = mongoose.model("product", productSchema);

export default product;
