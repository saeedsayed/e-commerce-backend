// routes
import productsRoute from "../modules/products/product.route.js";
import authRoute from "../modules/auth/auth.route.js";
import usersRout from "../modules/users/users.route.js";
import categoriesRoute from "../modules/categories/category.route.js";
import cartRoute from "../modules/carts/cart.route.js";
import wishListRoute from "../modules/wishlists/wishlist.route.js";
import homeRoute from "../modules/home/home.route.js";
import mediaLibraryRoute from "../modules/mediaLibrary/mediaLibrary.route.js";
import blogsRoute from "../modules/blogs/blog.route.js";
import shippingMethodsRoute from "../modules/shippingMethods/shippingMethod.route.js";
import couponRoute from "../modules/coupons/coupon.route.js";
import reviewRoute from "../modules/reviews/review.route.js";
import paymentRoute from "../modules/payments/payment.route.js";
import orderRouter from "../modules/orders/order.route.js";
import addressesRoute from "../modules/addresses/address.route.js";
import analyses from "../modules/analyses/analysis.route.js";
import cronjobRoute from "../modules/cronjobs/cronjob.route.js";

export default (app) => {
  app.use("/api/v1/home", homeRoute);
  app.use("/api/v1/media-library", mediaLibraryRoute);
  app.use("/api/v1/products", productsRoute);
  app.use("/api/v1/categories", categoriesRoute);
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/users", usersRout);
  app.use("/api/v1/cart", cartRoute);
  app.use("/api/v1/wishlist", wishListRoute);
  app.use("/api/v1/blogs", blogsRoute);
  app.use("/api/v1/shipping", shippingMethodsRoute);
  app.use("/api/v1/coupon", couponRoute);
  app.use("/api/v1/review", reviewRoute);
  app.use("/api/v1/payment", paymentRoute);
  app.use("/api/v1/addresses", addressesRoute);
  app.use("/api/v1/orders", orderRouter);
  app.use("/api/v1/analyses", analyses);
  app.use("/api/v1/cronjob", cronjobRoute);
};
