import { Router } from "express";
import { checkToken, restrictTo } from "../../middlewares/auth.middleware.js";
import {
  getOrderByIdController,
  getUserOrdersController,
  getAllOrdersController,
} from "./order.controller.js";
import roles from "../../constants/roles.constant.js";
import { paginate } from "../../middlewares/pagination.middleware.js";
import Order from "./order.model.js";

const router = Router();

router.route("/history").get(checkToken, getUserOrdersController);
router.route("/history/:id").get(checkToken, getOrderByIdController);
router.route("/user/:id").get(checkToken, restrictTo(roles.ADMIN), getUserOrdersController);
router
  .route("/")
  .get(
    checkToken,
    restrictTo(roles.ADMIN),
    paginate(Order),
    getAllOrdersController,
  );

export default router;
