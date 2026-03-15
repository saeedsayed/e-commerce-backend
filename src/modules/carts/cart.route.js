import express from "express";
import {
  addToCart,
  clearCart,
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

router.route("/clear").delete(checkToken, clearCart);
export default router;
