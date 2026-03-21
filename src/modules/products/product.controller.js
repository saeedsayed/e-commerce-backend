import appError from "../../utils/appError.js";
import STATUS from "../../constants/httpStatus.constant.js";
import product from "./product.model.js";
import { isValidObjectId } from "mongoose";

// ===================================================================
const getAllProducts = async (req, res) => {
  const { pagination, filter } = req;
  const {
    currentPage,
    nextPage,
    previousPage,
    totalDocuments,
    limit,
    totalPages,
    skip,
  } = pagination;
  const products = await product.find(filter).skip(skip).limit(limit);
  res.send({
    status: STATUS.SUCCESS,
    data: products,
    results: totalDocuments,
    paginate: {
      currentPage: currentPage,
      nextPage: nextPage,
      previousPage: previousPage,
      totalPages: totalPages,
      limit: limit,
    },
  });
};
// ====================================================================
const getSingleProduct = async (req, res, next) => {
  const { id } = req.params;
  const isValidID = isValidObjectId(id);
  if (!isValidID) {
    const err = appError.create("invalid product id", 400, STATUS.FAIL);
    return next(err);
  }
  // if(req.body.versions.version)
  const targetProduct = await product.findById(id).populate("versions.version");
  if (!targetProduct) {
    const err = appError.create("product not found", 404, STATUS.FAIL);
    return next(err);
  }
  res.send({
    status: STATUS.SUCCESS,
    data: targetProduct,
  });
};
// ====================================================================
const createProduct = async (req, res, next) => {
  const productData = req.body;
    productData?.versions?.forEach((v) => {
    if (!isValidObjectId(v.version)) {
      const err = appError.create("invalid version id", 400, STATUS.FAIL);
      return next(err);
    }
  });
  const newProduct = new product(productData);
  await newProduct.save();
  res.status(201).json({
    status: STATUS.SUCCESS,
    data: newProduct,
    message: "product created successfully",
  });
};
// ====================================================================
const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const update = req.body;
  const isValidID = isValidObjectId(id);
  if (!isValidID) {
    const err = appError.create("invalid product id", 400, STATUS.FAIL);
    return next(err);
  }
  const updatedProduct = await product.findByIdAndUpdate(id, update, {
    new: true,
  });
  if (!updatedProduct) {
    const err = appError.create("product not found", 404, STATUS.FAIL);
    return next(err);
  }

  res.send({
    status: STATUS.SUCCESS,
    data: updatedProduct,
    message: "product updated successfully",
  });
};
// ====================================================================
const deleteProduct = async (req, res, next) => {
  const { id } = req.params;
  const isValidID = isValidObjectId(id);
  if (!isValidID) {
    const err = appError.create("invalid product id", 400, STATUS.FAIL);
    return next(err);
  }
  const deletedProduct = await product.findByIdAndDelete(id);
  if (!deletedProduct) {
    const err = appError.create("product not found", 404, STATUS.FAIL);
    return next(err);
  }
  res.send({
    status: STATUS.SUCCESS,
    data: deletedProduct,
    message: "product deleted successfully",
  });
};

export {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
