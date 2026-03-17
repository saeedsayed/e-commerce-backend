import express from "express";
import {
  createShippingMethod,
  deleteShippingMethod,
  getShippingMethodByIdController,
  getShippingMethods,
  updateShippingMethod,
} from "./shippingMethod.controller.js";
import { checkToken, restrictTo } from "../../middlewares/auth.middleware.js";
import roles from "../../constants/roles.constant.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createShippingMethodSchema,
  updateShippingMethodSchema,
} from "./shippingMethod.validator.js";
import { filter } from "../../middlewares/filter.middleware.js";
const router = express.Router();

router
  .route("/")
  .get(filter, getShippingMethods)
  .post(
    checkToken,
    restrictTo(roles.ADMIN),
    validate(createShippingMethodSchema),
    createShippingMethod,
  );
router
  .route("/:id")
  .get(getShippingMethodByIdController)
  .put(
    checkToken,
    restrictTo(roles.ADMIN),
    validate(updateShippingMethodSchema),
    updateShippingMethod,
  )
  .delete(checkToken, restrictTo(roles.ADMIN), deleteShippingMethod);

export default router;
