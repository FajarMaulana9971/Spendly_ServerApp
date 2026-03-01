import express from "express";
import paymentController from "../controllers/paymentController.js";
import cacheMiddleware from "../middlewares/cacheMiddleware.js";

const paymentRouter = express.Router();

paymentRouter.post("/payment", paymentController.payBySelectedExpenses);

paymentRouter.get(
  "/payment/total-paid",
  cacheMiddleware(300),
  paymentController.getTotalPaid,
);

paymentRouter.get(
  "/payment",
  cacheMiddleware(300),
  paymentController.getAllPayments,
);

paymentRouter.get(
  "/payment/:id",
  cacheMiddleware(300),
  paymentController.getPaymentById,
);

export default paymentRouter;
