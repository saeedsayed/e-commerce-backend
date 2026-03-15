import { isValidObjectId } from "mongoose";
import Cart from "./cart.model.js";
import appError from "../../utils/appError.js";
import STATUS from "../../constants/httpStatus.constant.js";
// import user from "../users/user.model.js";
import calculateCartSubTotal from "../../utils/calculateCartSubTotal.js";
import { getCart } from "./cart.service.js";

// ===============================  Get Cart ============================================
const getCartController = async (req, res, next) => {
  try {
    const cart = await getCart(req.userId);
    res.json({ status: STATUS.SUCCESS, data: cart });
  } catch (error) {
    next(error);
  }
};
// ==============================  Add To Cart ============================================
const addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  try {
    const isValidID = isValidObjectId(productId);
    if (!isValidID) {
      const err = appError.create("Invalid product ID", 400, STATUS.FAIL);
      return next(err);
    }
    const cart = await Cart.findOne({ user: req.userId }).populate(
      "products.product",
    );
    // Create a new cart if it doesn't exist
    if (!cart) {
      cart = new Cart({
        user: req.userId,
        products: [{ product: productId, quantity }],
        totalPrice: 0,
      });
    } else {
      // Check if product exists in the array
      const productIndex = cart.products.findIndex(
        (p) => p.product._id.toString() === productId,
      );

      if (productIndex > -1) {
        // CASE A: Product exists -> Update Quantity
        cart.products[productIndex].quantity = quantity;
      } else {
        // CASE B: Product does not exist -> Push new item
        cart.products.unshift({ product: productId, quantity: quantity });
      }
    }
    // Calculate total price
    cart.totalPrice = calculateCartSubTotal(
      (await cart.populate("products.product")).products,
    );
    await cart.save();
    res.json({
      status: STATUS.SUCCESS,
      data: cart,
      message: "Product added to cart",
    });
  } catch (error) {
    next(error);
  }
};
// ==============================  Remove From Cart ============================================
const removeFromCart = async (req, res, next) => {
  const { productId } = req.body;
  try {
    const isValidID = isValidObjectId(productId);
    if (!isValidID) {
      const err = appError.create("Invalid product ID", 400, STATUS.FAIL);
      return next(err);
    }
    const cart = await Cart.findOne({ user: req.userId }).populate(
      "products.product",
    );
    if (!cart) {
      const err = appError.create("Cart not found", 404, STATUS.FAIL);
      return next(err);
    }
    cart.products = cart.products.filter(
      (p) => p.product._id.toString() !== productId,
    );
    cart.totalPrice = calculateCartSubTotal(cart.products);
    await cart.save();
    res.json({
      status: STATUS.SUCCESS,
      data: cart,
      message: "Product removed from cart",
    });
  } catch (error) {
    next(error);
  }
};
// =============================  Clear Cart ===========================================
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      const err = appError.create("Cart not found", 404, STATUS.FAIL);
      return next(err);
    }
    cart.products = [];
    cart.totalPrice = 0;
    await cart.save();
    res.json({
      status: STATUS.SUCCESS,
      data: cart,
      message: "Cart cleared",
    });
  } catch (error) {
    next(error);
  }
};

export { getCartController, addToCart, removeFromCart, clearCart };
