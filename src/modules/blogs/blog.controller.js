import { isValidObjectId } from "mongoose";
import blog from "./blog.model.js";
import appError from "../../utils/appError.js";
import STATUS from "../../constants/httpStatus.constant.js";

// ========================== get all blogs ==========================
export const getBlogs = async (req, res, next) => {
  try {
    const { filter } = req;
    const blogs = await blog.find(filter).sort({ createdAt: -1 });
    res.json({
      status: STATUS.SUCCESS,
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};
// ========================== create a blog ==========================
export const createBlog = async (req, res, next) => {
  try {
    const { title, content, tags, thumbnail, author } = req.body;
    const newBlog = new blog({
      title,
      content,
      tags,
      thumbnail,
      author,
    });
    await newBlog.populate("author", "fullName email");
    await newBlog.save();
    res.json({
      status: STATUS.SUCCESS,
      data: newBlog,
    });
  } catch (error) {
    next(error);
  }
};
// ========================== get a blog by ID ==========================
export const getBlogById = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const targetBlog = await blog
      .findById(blogId)
      .populate("author", "fullName email");
    if (!targetBlog) {
      return res.status(404).json({
        status: STATUS.FAIL,
        message: "Blog not found",
      });
    }
    res.json({
      status: STATUS.SUCCESS,
      data: targetBlog,
    });
  } catch (error) {
    next(error);
  }
};
// ========================== delete a blog by ID ==========================
export const deleteBlogById = async (req, res, next) => {
  try {
    const blogId = req.params.id;
    const deletedBlog = await blog.findByIdAndDelete(blogId);
    if (!deletedBlog) {
      return res.status(404).json({
        status: STATUS.FAIL,
        message: "Blog not found",
      });
    }
    res.json({
      status: STATUS.SUCCESS,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
// ============================== update a blog =====================
export const updateBlog = async (req, res, next) => {
  try {
    const update = req.body;
    const blogId = req.params.id;
    if (!isValidObjectId(blogId)) {
      const err = appError.create("invalid blog ID", 400, STATUS.FAIL);
      return next(err);
    }
    const updatedBlog = await blog
      .findByIdAndUpdate(blogId, update, { new: true })
      .populate("author", "fullName email");
    if (!updatedBlog) {
      const err = appError.create("blog not found", 404, STATUS.FAIL);
      return next(err);
    }
    res.json({
      status: STATUS.SUCCESS,
      message: "blog updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    next(error);
  }
};
