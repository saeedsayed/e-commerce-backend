import { z as Z } from "zod";

const sizeEnum = ["XS", "S", "M", "L", "XL", "XXL"];
const weightUnitEnum = ["MG", "G", "KG"];
const dimensionUnitEnum = ["MM", "CM", "M"];

const dimensionValueSchema = Z.object({
  value: Z.number("dimension value must be a number"),
  uint: Z.enum(dimensionUnitEnum, "dimension unit must be one of MM, CM, M"),
});

export const createProductSchema = Z.object({
  title: Z.string("title is required")
    .min(2, "title must be at least 2 characters")
    .max(100),
  cost: Z.number("cost is required and must be a positive number").min(
    0.1,
    "cost must be at least 0.1",
  ),
  description: Z.string("description is required")
    .min(10, "description must be at least 10 characters")
    .max(1000),
  thumbnail: Z.string("thumbnail is required"),
  price: Z.number("price is required and must be a positive number").min(
    0.1,
    "price must be at least 0.1",
  ),
  category: Z.array(Z.string()).min(1, "at least one category is required"),
  stock: Z.number("stock must be a non-negative number")
    .min(0, "stock must be at least 0")
    .optional(),
  discount: Z.number("discount must be a non-negative number")
    .min(0, "discount must be at least 0")
    .optional(),
  isActive: Z.boolean("isActive must be a boolean").optional(),
  images: Z.optional(Z.array(Z.string("each image must be a string"))),
  colors: Z.optional(
    Z.array(
      Z.object({
        colorName: Z.string("colorName must be a string").optional(),
        colorCode: Z.string("colorCode must be a string").optional(),
        images: Z.array(
          Z.string("each color image must be a string"),
        ).optional(),
      }),
    ),
  ),
  sizes: Z.optional(Z.array(Z.enum(sizeEnum))),
  weight: Z.object({
    value: Z.number("weight value must be a number"),
    uint: Z.enum(weightUnitEnum, "weight unit must be one of MG, G, KG"),
  })
    .nullable()
    .optional(),
  dimensions: Z.object({
    length: dimensionValueSchema.nullable().optional(),
    width: dimensionValueSchema.nullable().optional(),
    height: dimensionValueSchema.nullable().optional(),
    depth: dimensionValueSchema.nullable().optional(),
  }).optional(),
  versions: Z.optional(
    Z.array(
      Z.object({
        version: Z.string("version must be a valid product id").optional(),
        versionName: Z.string("versionName must be a string").optional(),
      }),
    ),
  ),
  rating: Z.number("rating must be a number between 0 and 5")
    .min(0, "rating must be at least 0")
    .max(5, "rating must be at most 5")
    .optional(),
  reviewsCount: Z.number("reviewsCount must be a non-negative number")
    .min(0, "reviewsCount must be at least 0")
    .optional(),
}).refine(
  (data) => {
    console.log("data.price > data.cost", data.price > data.cost);
    return data.price > data.cost;
  },
  {
    message: "price must be greater than cost",
    path: ["price"],
  },
);
