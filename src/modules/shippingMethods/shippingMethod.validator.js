import { z as Z } from "zod";

export const createShippingMethodSchema = Z.object({
  name: Z.string("name is required and must be a string")
    .min(2, "name must be at least 2 characters long")
    .max(100, "name must be at most 100 characters long"),
  description: Z.string("description is required and must be a string")
    .max(500, "description must be at most 500 characters long")
    .optional(),
  cost: Z.number("cost is required and must be a number").min(
    0,
    "cost must be a positive number",
  ),

  estimatedDeliveryDays: Z.number(
    "estimatedDeliveryDays is required and must be a number",
  ).min(1, "estimatedDeliveryDays must be at least 1"),
  regions: Z.array(Z.string("region is required and must be a string")).min(
    1,
    "at least one region must be specified",
  ),
  isActive: Z.boolean("active state must be boolean").optional(),
});
export const updateShippingMethodSchema = Z.object({
  name: Z.string("name is required and must be a string")
    .min(2, "name must be at least 2 characters long")
    .max(100, "name must be at most 100 characters long")
    .optional(),
  description: Z.string("description is required and must be a string")
    .max(500, "description must be at most 500 characters long")
    .optional(),
  cost: Z.number("cost is required and must be a number")
    .min(0, "cost must be a positive number")
    .optional(),
  estimatedDeliveryDays: Z.number(
    "estimatedDeliveryDays is required and must be a number",
  )
    .min(1, "estimatedDeliveryDays must be at least 1")
    .optional(),
  regions: Z.array(Z.string("region is required and must be a string"))
    .min(1, "at least one region must be specified")
    .optional(),
  isActive: Z.boolean("isActive must be a boolean").optional(),
});
