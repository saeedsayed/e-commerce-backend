import Order from "../orders/order.model.js";
import user from "../users/user.model.js";

export const dailySales = async () =>
  await Order.aggregate([
    { $match: { status: "paid" } },

    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        totalSales: { $sum: "$pricing.total" },
        orders: { $sum: 1 },
      },
    },

    { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
    { $limit: 30 },
  ]);

export const monthlySales = async () =>
  await Order.aggregate([
    { $match: { status: "paid" } },

    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalSales: { $sum: "$pricing.total" },
        orders: { $sum: 1 },
      },
    },

    { $sort: { "_id.year": -1, "_id.month": -1 } },
  ]);
export const yearlySales = async () =>
  await Order.aggregate([
    { $match: { status: "paid" } },

    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
        },
        totalSales: { $sum: "$pricing.total" },
        orders: { $sum: 1 },
      },
    },

    { $sort: { "_id.year": -1 } },
  ]);

export const totalRevenue = async () =>
  await Order.aggregate([
    { $match: { status: "paid" } },

    {
      $group: {
        _id: null,
        revenue: { $sum: "$pricing.total" },
      },
    },
  ]);

export const topProducts = async () =>
  await Order.aggregate([
    { $match: { status: "paid" } },

    { $unwind: "$items" },

    {
      $group: {
        _id: "$items.product",
        unitsSold: { $sum: "$items.quantity" },
      },
    },

    { $sort: { unitsSold: -1 } },

    { $limit: 10 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 0,
        name: "$product.title",
        unitsSold: 1,
        revenue: {
          $multiply: ["$product.price", "$unitsSold"],
        },
      },
    },
  ]);

export const newCustomersCount = async (lastDaysCount = 1) => {
  return await user
    .find({
      createdAt: {
        $gte: new Date(Date.now() - lastDaysCount * 24 * 60 * 60 * 1000),
      },
    })
    .countDocuments();
};

export const allCustomersCount = async () => await user.find().countDocuments();
