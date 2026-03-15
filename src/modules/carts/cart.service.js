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
