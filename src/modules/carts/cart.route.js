import express from "express";
import {
  addToCart,
  clearCartController,
  getCartController,
  removeFromCart,
} from "./cart.controller.js";
import { checkToken } from "../../middlewares/auth.middleware.js";
const router = express.Router();
router
  .route("/")
  .get(checkToken, getCartController)
  .post(checkToken, addToCart)
  .delete(checkToken, removeFromCart);

router.route("/clear").delete(checkToken, clearCartController);
export default router;
