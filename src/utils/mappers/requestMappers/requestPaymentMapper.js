import PaymentBySelectedExpenseRequest from "../../../dtos/requests/paymentBySelectedExpenseRequest.js"

export const requestPaymentMapper = (body) => {
    return PaymentBySelectedExpenseRequest({
        totalAmount: body.totalAmount, paidAt: body.paidAt, note: body.note, expenseIds: body.expenseIds
    })
}
