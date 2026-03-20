import STATUS from "../../constants/httpStatus.constant.js";
import appError from "../../utils/appError.js";
import stripe from "../../utils/stripe.config.js";
// import Cart from "../carts/cart.model.js";
import { clearCart, getCart } from "../carts/cart.service.js";
import coupon from "../coupons/coupon.model.js";
import { applyCoupon, checkCoupon } from "../coupons/coupon.service.js";
import Order from "../orders/order.model.js";
import product from "../products/product.model.js";
import { getShippingMethodById } from "../shippingMethods/shippingMethod.service.js";
// import user from "../users/user.model.js";

export const createInvoice = async (userId, shippingMethodId, couponCode) => {
  // create a bill for the user based on their cart, shipping method and coupon
  const cart = await getCart(userId);
  if (!cart) {
    const err = appError.create(
      "cart not found for this user",
      404,
      STATUS.FAIL,
    );
    throw err;
  }
  if (!cart.products.length) {
    const err = appError.create("the user cart is empty", 400, STATUS.FAIL);
    throw err;
  }
  const { cost: shippingCost } = await getShippingMethodById(shippingMethodId);
  let totalAmount = cart.totalPrice + shippingCost; //   calculate the total amount based on cart, shipping method
  let discount = 0;
  //   chick if user have coupon
  if (couponCode && couponCode.trim() !== "") {
    await checkCoupon(couponCode);
    const coupon = await applyCoupon(couponCode, cart._id);
    totalAmount -= coupon.discount; // update the total amount after apply the coupon discount
    discount = coupon.discount;
  }
  return {
    subTotal: cart.totalPrice,
    shipping: shippingCost,
    discount,
    total: totalAmount.toFixed(2),
    coupon: couponCode,
  };
};

export const createPaymentIntent = async (totalAmount) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: (totalAmount * 100).toFixed(0), // convert to cents
    currency: "usd",
    // automatic_payment_methods: {
    //   enabled: true,
    // },
    payment_method_types: ["card"],
  });
  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
};

export const handleSuccessfulPayment = async (paymentIntentObject) => {
  // this function will be called after receiving the webhook event from stripe about successful payment, it will update the order status to paid and save the payment details in the order document
  const order = await Order.findOne({
    paymentIntentId: paymentIntentObject.id,
  });
  if (!order) {
    const err = appError.create(
      "order not found for this payment intent",
      404,
      STATUS.FAIL,
    );
    throw err;
  }
  if (order.status === "paid" || order.status === "delivered") {
    // if the order is already marked as paid or delivered, do nothing to prevent duplicate processing of the same payment intent
    return;
  }
  order.status = "paid";
  order.paidAt = new Date();
  order.paymentDetails = {
    paymentIntentId: paymentIntentObject.id,
    amount: paymentIntentObject.amount,
    currency: paymentIntentObject.currency,
    method: paymentIntentObject?.payment_method_types[0],
  };
  await order.save();
  // Increment the coupon used count
  if (!!order.coupon)
    await coupon.findByIdAndUpdate(order.coupon, { $inc: { usedCount: 1 } });
  await clearCart(order.user?._id);
  await Promise.all(
    // update the stock for each product in the order
    order.items.map(async (item) => {
      const productDocumented = await product.findById(item.product._id);
      if (productDocumented) {
        productDocumented.stock -= item.quantity;
        await productDocumented.save();
      }
    }),
  );
};

export const handleFailedPayment = async (paymentIntentObject) => {
  console.log("failed paymentIntentObject", paymentIntentObject);
  // this function will be called after receiving the webhook event from stripe about failed payment, it will update the order status to payment_failed and save the payment details in the order document
  const order = await Order.findOne({
    paymentIntentId: paymentIntentObject.id,
  });
  if (!order) {
    const err = appError.create(
      "order not found for this payment intent",
      404,
      STATUS.FAIL,
    );
    throw err;
  }
  order.status = "payment_failed";
  order.paymentDetails = {
    paymentIntentId: paymentIntentObject.id,
    amount: paymentIntentObject.amount,
    currency: paymentIntentObject.currency,
    method: paymentIntentObject.method_types[0],
  };
  await order.save();
};
