import express from "express";
import paymentController from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post('/payment',paymentController.payBySelectedExpenses);

export default paymentRouter;
