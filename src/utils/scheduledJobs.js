import nodeCron from "node-cron";
import { expirationIncompleteOrders } from "../modules/orders/order.service.js";
export const scheduledJobs = async () => {
  await expirationIncompleteOrdersJob();
};

const expirationIncompleteOrdersJob = async () => {
  nodeCron.schedule("*/20 * * * *", async () => {
    await expirationIncompleteOrders();
  });
};
