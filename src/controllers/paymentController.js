import paymentService from "../services/paymentService.js"
import BaseResponse from "../dtos/responses/base/baseResponse.js";
import {requestPaymentMapper} from "../utils/mappers/requestMappers/requestPaymentMapper.js";
import {toPaymentBySelectedExpenseResponse} from "../utils/mappers/responseMappers/responsePaymentMapper.js";

class PaymentController {

    async payBySelectedExpenses(req, res, next) {
        try {

            const request = requestPaymentMapper(req.body)

            const result = await paymentService.payBySelectedExpenses(request)

            const response = toPaymentBySelectedExpenseResponse(result)

            res.status(201).json(
                BaseResponse.success(response, 'Payment created successfully')
            );

        } catch (err) {
            next(err)
        }
    }
}

export default new PaymentController();