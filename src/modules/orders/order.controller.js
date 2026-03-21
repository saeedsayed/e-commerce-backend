import mongoose from "mongoose";
import STATUS from "../../constants/httpStatus.constant.js";
import { getAllOrders, getOrderById, getUserOrders } from "./order.service.js";
import appError from "../../utils/appError.js";

export const getOrderByIdController = async (req, res) => {
  const orderId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    const err = appError.create("Invalid order ID", 400, STATUS.FAIL);
    throw err;
  }
  const { userId } = req;
  const order = await getOrderById(orderId, userId);
  res.json({
    status: STATUS.SUCCESS,
    data: order,
  });
};

export const getUserOrdersController = async (req, res) => {
  const userId = req.params?.id || req.userId;
  const orders = await getUserOrders(userId);
  res.json({
    status: STATUS.SUCCESS,
    data: orders,
  });
};

export const getAllOrdersController = async (req, res) => {
  const { pagination, filter } = req;
  const orders = await getAllOrders(filter, pagination);
  res.json({
    status: STATUS.SUCCESS,
    data: orders,
    result: pagination.totalDocuments,
    paginate: pagination,
  });
};
