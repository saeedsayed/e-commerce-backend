import STATUS from "../../constants/httpStatus.constant.js";

import {
  addReview,
  getProductReviews,
  removeReview,
  updateReview,
} from "./review.service.js";

export const addReviewController = async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const { userId } = req;
  const data = await addReview(productId, userId, comment, rating);
  res.status(201).json({
    status: STATUS.SUCCESS,
    message: "Review added successfully",
    data,
  });
};

export const getProductReviewsController = async (req, res) => {
  const { productId } = req.params;
  const reviews = await getProductReviews(productId);
  res.json({
    status: STATUS.SUCCESS,
    data: reviews,
  });
};

export const removeReviewController = async (req, res) => {
  const { reviewId } = req.params;
  const { userId } = req;
  await removeReview(reviewId, userId);
  res.status(204).send();
};

export const updateReviewController = async (req, res) => {
  const { reviewId } = req.params;
  const { userId } = req;
  const update = req.body;
  const updatedReview = await updateReview(reviewId, userId, update);
  res.status(201).json({
    status: STATUS.SUCCESS,
    message: "review updated successfully",
    data: updatedReview,
  });
};
