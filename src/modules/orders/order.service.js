import coupon from "../coupons/coupon.model.js";
import user from "../users/user.model.js";
import Order from "./order.model.js";

export const placeOrder = async ({
  userId,
  shippingMethodId,
  pricing,
  paymentIntentId,
  couponCode = null,
}) => {
  const couponId = await coupon.findOne({ code: couponCode }).select("_id");
  const cart = await user.findById(userId).select("cart").populate("cart");
  if (cart?.cart?.totalPrice !== pricing.subTotal) {
    // check if the cart total price has been changed after creating the payment intent, if yes, throw an error to prevent placing the order with wrong total price
    const err = appError.create(
      "cart total price has been changed, please review your order before payment",
      400,
      STATUS.FAIL,
    );
    throw err;
  }
  const userOrders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  if (userOrders[0]?.status === "pending_payment") {
    // if the user have an order with pending payment status, update it instead of creating a new one
    userOrders[0].items = cart.cart.products;
    userOrders[0].pricing = pricing;
    userOrders[0].paymentIntentId = paymentIntentId;
    userOrders[0].coupon = couponId?._id || null;
    userOrders[0].shippingMethod = shippingMethodId;
    await userOrders[0].save();
    return userOrders[0];
  }
  const order = await Order.create({
    // create a new order
    user: userId,
    shippingMethod: shippingMethodId,
    items: cart.cart.products,
    pricing,
    paymentIntentId,
    coupon: couponId?._id || null,
    status: "pending_payment",
  });
  return order;
};

export const getOrderById = async (orderId, userId) => {
  const { role } = await user.findById(userId).select("role");

  const order = await Order.findOne(
    role === "admin" ? { _id: orderId } : { _id: orderId, user: userId },
  )
    .populate({ path: "items.product" })
    .populate("shippingMethod")
    .populate("coupon")
    .populate("user");
  if (!order) {
    const err = appError.create("order not found", 404, STATUS.FAIL);
    throw err;
  }
  return order;
};

export const getUserOrders = async (userId) => {
  //   const {role} = await user.findById(userId).select("role")
  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({ path: "items.product" })
    .populate("shippingMethod")
    .populate("coupon")
    .select("-user");
  return orders;
};

export const getAllOrders = async (paginate) => {
  const {
    limit,
    skip,
    // totalPages,
    // currentPage,
    // nextPage,
    // previousPage,
    // totalDocuments,
  } = paginate;
  const orders = await Order.find()
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 })
    .populate({ path: "items.product" })
    .populate("shippingMethod")
    .populate("coupon")
    .populate("user");
  return orders;
};

export const expirationIncompleteOrders = async () => {
  const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
  await Order.updateMany(
    {
      status: "pending_payment",
      createdAt: { $lte: twentyMinutesAgo },
    },
    {
      $set: { status: "expired" },
    },
  );
};
