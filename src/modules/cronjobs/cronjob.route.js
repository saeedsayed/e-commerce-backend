import { Router } from "express";
import { expirationIncompleteOrders } from "../orders/order.service.js";

const router = Router();

router.route("/expirationIncompleteOrders").get(async (req, res) => {
  await expirationIncompleteOrders();
  res.status(200).end();
});

export default router;
