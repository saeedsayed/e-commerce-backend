import { configDotenv } from "dotenv";
import express from "express";
import { connectDB } from "./utils/db.js";
import CookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import v1Routes from "./routes/v1.routes.js";
import STATUS from "./constants/httpStatus.constant.js";
// import stripe from "./utils/stripe.config.js";
import webhookStripeRoute from "./modules/payments/payment.webhook.js";
import { scheduledJobs } from "./utils/scheduledJobs.js";
configDotenv();
await connectDB();
await scheduledJobs();
const app = express();
const port = process.env.PORT || 4000;
const DEVELOP_MODE = process.env.NODE_ENV === "development";

app.use(cors());
app.use(webhookStripeRoute); // to handle stripe webhooks before body parsing middleware
app.use(express.json());
app.use(CookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  }),
);

v1Routes(app);

// handle 404 routes
app.use((req, res, next) => {
  res
    .status(404)
    .json({ status: "error", message: "route not defined", code: 404 });
});
// handle errors globally
app.use((err, req, res, next) => {
  console.log("err", err);
  if (err.code === 11000) {
    res.status(400).json({
      status: STATUS.ERROR,
      message: `you duplicate a uniq value db err message => ${err.errorResponse.errmsg}`,
      code: 400,
      data: err.keyValue,
    });
  }
  res.status(err.code || 500).json({
    status: err.status || "error",
    message: err.message || "internal server error",
    code: err.code,
    data: err.data,
  });
});

app.listen(port, () => {
  if (DEVELOP_MODE) {
    console.log(`Server is running on port ${port} 🚀`);
  } else {
    console.log(`Server is running 🚀`);
  }
});
