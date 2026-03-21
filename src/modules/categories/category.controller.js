import appError from "../../utils/appError.js";
import STATUS from "../../constants/httpStatus.constant.js";
import { isValidObjectId } from "mongoose";
import category from "./category.model.js";

// ===================================================================
const getCategories = async (req, res) => {
  const { filter } = req;
  const categories = await category.find(filter);
  const categoriesLength = await category.find().countDocuments();
  res.send({
    status: STATUS.SUCCESS,
    data: categories,
    result: categoriesLength,
  });
};
// ====================================================================
const createCategory = async (req, res, next) => {
  const categoryData = req.body;
  const isCategoryExists = await category.findOne({ name: categoryData.name });
  if (isCategoryExists) {
    const err = appError.create("category already exists", 400, STATUS.FAIL);
    return next(err);
  }
  const newCategory = new category(categoryData);
  await newCategory.save();
  res
    .json({
      status: STATUS.SUCCESS,
      data: newCategory,
      message: "category created successfully",
    })
    .end();
};
// ====================================================================
const updateCategory = async (req, res, next) => {
  const { id } = req.params;
  const update = req.body;
  const isValidID = isValidObjectId(id);
  if (!isValidID) {
    const err = appError.create("invalid category id", 400, STATUS.FAIL);
    return next(err);
  }
  const updatedCategory = await category.findByIdAndUpdate(id, update, {
    new: true,
  });
  if (!updatedCategory) {
    const err = appError.create("category not found", 404, STATUS.FAIL);
    return next(err);
  }

  res.send({
    status: STATUS.SUCCESS,
    data: updatedCategory,
    message: "category updated successfully",
  });
};
// ====================================================================
const deleteCategory = async (req, res, next) => {
  const { id } = req.params;
  const isValidID = isValidObjectId(id);
  if (!isValidID) {
    const err = appError.create("invalid category id", 400, STATUS.FAIL);
    return next(err);
  }
  const deletedCategory = await category.findByIdAndDelete(id);
  if (!deletedCategory) {
    const err = appError.create("category not found", 404, STATUS.FAIL);
    return next(err);
  }
  res.send({
    status: STATUS.SUCCESS,
    data: deletedCategory,
    message: "category deleted successfully",
  });
};

export { getCategories, createCategory, updateCategory, deleteCategory };
