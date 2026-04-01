import { Router } from "express";
import { checkToken, restrictTo } from "../../middlewares/auth.middleware.js";
import roles from "../../constants/roles.constant.js";
import {
  averageOrderValueController,
  customersCountController,
  newCustomersController,
  ordersCountController,
  sales,
  topProductsController,
  totalRevenueController,
} from "./analysis.controller.js";

const router = Router();

router
  .route("/revenue")
  .get(checkToken, restrictTo(roles.ADMIN), totalRevenueController);
router.route("/sales").get(checkToken, restrictTo(roles.ADMIN), sales);
router
  .route("/top-products")
  .get(checkToken, restrictTo(roles.ADMIN), topProductsController);
router
  .route("/new-customers")
  .get(checkToken, restrictTo(roles.ADMIN), newCustomersController);
router
  .route("/aov")
  .get(checkToken, restrictTo(roles.ADMIN), averageOrderValueController);
router
  .route("/customers-count")
  .get(checkToken, restrictTo(roles.ADMIN), customersCountController);
router
  .route("/orders-count")
  .get(checkToken, restrictTo(roles.ADMIN), ordersCountController);

export default router;
