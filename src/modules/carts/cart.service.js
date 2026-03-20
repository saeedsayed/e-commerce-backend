import Cart from "./cart.model.js";

// ===============================  Get Cart ============================================
export const getCart = async (userId) => {
  try {
    let cart = await Cart.findOne({ user: userId }).populate(
      "products.product",
    );
    if (!cart) {
      cart = new Cart({
        user: req.userId,
        products: [],
        totalPrice: 0,
      });
      const userDocument = await user.findById(userId);
      userDocument.cart = cart._id;
      await cart.save();
      await userDocument.save();
    }
    return cart;
  } catch (error) {
    throw error;
  }
};
// ======================== Clear cart ==========================
export const clearCart = async (userId) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      // after placing the order and successful payment, clear the user's cart
      { user: userId },
      {
        $set: {
          products: [],
          totalPrice: 0,
        },
      },
      { new: true },
    );
    if (!cart) {
      const err = appError.create("Cart not found", 404, STATUS.FAIL);
      return next(err);
    }
    return cart;
  } catch (error) {
    throw error;
  }
};
