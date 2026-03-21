import express from "express";
import {
  getCategories,
  updateCategory,
  createCategory,
  deleteCategory,
} from "./category.controller.js";
import { checkToken, restrictTo } from "../../middlewares/auth.middleware.js";
import roles from "../../constants/roles.constant.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createCategorySchema } from "./category.validator.js";
import { filter } from "../../middlewares/filter.middleware.js";

const router = express.Router();

router
  .route("/")
  .get(filter, getCategories)
  .post(checkToken, validate(createCategorySchema), createCategory);
router
  .route("/:id")
  .put(checkToken, restrictTo(roles.ADMIN), updateCategory)
  .delete(checkToken, restrictTo(roles.ADMIN), deleteCategory);

export default router;
