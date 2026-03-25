import STATUS from "../../constants/httpStatus.constant.js";
import {
  allCustomersCount,
  dailySales,
  monthlySales,
  newCustomersCount,
  topProducts,
  totalRevenue,
  yearlySales,
} from "./analysis.service.js";

export const sales = async (req, res) => {
  const duration = req.query.duration || "daily";
  let sales = [];
  switch (duration) {
    case "yearly":
      sales = await yearlySales();
      break;
    case "monthly":
      sales = await monthlySales();
      break;
    default:
      sales = await dailySales();
  }

  res.json({
    status: STATUS.SUCCESS,
    duration,
    data: sales,
  });
};

export const totalRevenueController = async (req, res) => {
  const r = await totalRevenue();
  res.json({
    status: STATUS.SUCCESS,
    data: r,
  });
};

export const topProductsController = async (req, res) => {
  const topSellingProducts = await topProducts();
  res.json({
    status: STATUS.SUCCESS,
    data: topSellingProducts,
  });
};
export const newCustomersController = async (req, res) => {
  const lastDaysCount = req.query.daysCount || 1;
  const NC = await newCustomersCount(lastDaysCount);
  res.json({
    status: STATUS.SUCCESS,
    message: `the new customers count in the last ${lastDaysCount} day(s)`,
    data: NC,
  });
};
export const allCustomersController = async (req, res) => {
  const customerCount = await allCustomersCount();
  res.json({
    status: STATUS.SUCCESS,
    data: customerCount,
  });
};
