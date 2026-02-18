import paymentService from "../services/paymentService.js";
import BaseResponse from "../dtos/responses/base/baseResponse.js";
import { requestPaymentMapper } from "../utils/mappers/requestMappers/requestPaymentMapper.js";
import ResponsePaymentBySelectedExpenseMapper from "../utils/mappers/responseMappers/responsePaymentMapper.js";

class PaymentController {
  async payBySelectedExpenses(req, res, next) {
    try {
      const request = requestPaymentMapper(req.body);
      const result = await paymentService.payBySelectedExpenses(request);

      res
        .status(201)
        .json(BaseResponse.success(result, "Payment created successfully"));
    } catch (err) {
      next(err);
    }
  }

  async getAllPayments(req, res, next) {
    try {
      const { page, limit, startDate, endDate, sortBy, sortOrder } = req.query;

      const filters = {
        page,
        limit,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      };

      const result = await paymentService.getAllPayments(filters);

      res
        .status(200)
        .json(BaseResponse.success(result, "Payment Successfully Retrieved"));
    } catch (err) {
      next(err);
    }
  }

  async getPaymentById(req, res, next) {
    try {
      const id = req.params.id;

      const result = await paymentService.getPaymentById(id);

      res.json(BaseResponse.success(result, "Payment Successfully Retrieved"));
    } catch (err) {
      next(err);
    }
  }
}

export default new PaymentController();
