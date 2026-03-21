import express from "express";
import {
  createBlog,
  deleteBlogById,
  getBlogById,
  getBlogs,
  updateBlog,
} from "./blog.controller.js";
import { checkToken, restrictTo } from "../../middlewares/auth.middleware.js";
import roles from "../../constants/roles.constant.js";
import { validate } from "../../middlewares/validate.middleware.js";
import blogSchema from "./blog.validator.js";
import { filter } from "../../middlewares/filter.middleware.js";
const router = express.Router();
router
  .route("/")
  .get(filter, getBlogs)
  .post(checkToken, restrictTo(roles.ADMIN), validate(blogSchema), createBlog);
router
  .route("/:id")
  .get(getBlogById)
  .put(checkToken, restrictTo(roles.ADMIN), updateBlog)
  .delete(checkToken, restrictTo(roles.ADMIN), deleteBlogById);
export default router;
