import { z as Z } from "zod";

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
  images: Z.optional(Z.array(Z.string().url("each image must be a valid URL"))),
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
  sizes: Z.optional(Z.array(Z.enum(["XS", "S", "M", "L", "XL", "XXL"]))),
  weight: Z.object({
    value: Z.number("weight value must be a number"),
    uint: Z.enum(["MG", "G", "KG"], "weight unit must be one of MG, G, KG"),
  })
    .nullable()
    .optional(),
  dimensions: Z.object({
    length: Z.number("length must be a number").nullable().optional(),
    width: Z.number("width must be a number").nullable().optional(),
    height: Z.number("height must be a number").nullable().optional(),
    depth: Z.number("depth must be a number").nullable().optional(),
  }).optional(),
  versions: Z.optional(
    Z.array(
      Z.object({
        version: Z.string("version must be a valid product id").optional(),
        versionName: Z.string("versionName must be a string").optional(),
      }),
    ),
  ),
});
