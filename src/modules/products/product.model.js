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
        unit: {
          type: String,
          enum: ["MG", "G", "KG"],
        },
        _id: false,
      },
      default: null,
    },
    dimensions: {
      length: {
        type: {
          value: { type: Number },
          unit: { type: String, enum: ["MM", "CM", "M"] },
          _id: false,
        },
        default: null,
      },
      width: {
        type: {
          value: { type: Number },
          unit: { type: String, enum: ["MM", "CM", "M"] },
          _id: false,
        },
        default: null,
      },
      height: {
        type: {
          value: { type: Number },
          unit: { type: String, enum: ["MM", "CM", "M"] },
          _id: false,
        },
        default: null,
      },
      depth: {
        type: {
          value: { type: Number },
          unit: { type: String, enum: ["MM", "CM", "M"] },
          _id: false,
        },
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
