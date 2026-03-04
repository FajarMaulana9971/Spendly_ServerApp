import PaymentBySelectedExpenseResponse from "../../../dtos/responses/paymentBySelectedExpenseResponse.js";
import PaymentResponse from "../../../dtos/responses/paymentResponse.js";

class ResponsePaymentBySelectedExpenseMapper {
  static mappingForSpecificPayment(payment) {
    if (!payment) {
      throw new Error("Payment not found");
    }

    return PaymentBySelectedExpenseResponse({
      id: payment.id.toString(),
      totalAmount: payment.totalAmount,
      paidAt: payment.paidAt,
      note: payment.note,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      expenses:
        payment.expenses?.map((exp) => ({
          id: exp.id.toString(),
          title: exp.title,
          amount: exp.amount,
          finalAmount: exp.finalAmount,
          category: exp.category,
          note: exp.note,
          isPaid: exp.isPaid,
          isSplitBill: exp.isSplitBill,
          spentAt: exp.spentAt,
          paymentId: exp.paymentId?.toString() ?? null,
          createdAt: exp.createdAt,
          updatedAt: exp.updatedAt,
        })) ?? [],
    });
  }

  static mappingForUnSpecificPayment(payments) {
    if (!payments) {
      throw new Error("Payment not found");
    }

    return payments.map((payment) => {
      const spentDates = payment.expenses?.map((e) => e.spentAt) ?? [];
      const minSpentAt = spentDates.length > 0 ? spentDates[0] : null;
      const maxSpentAt =
        spentDates.length > 0 ? spentDates[spentDates.length - 1] : null;

      return PaymentResponse({
        id: payment.id.toString(),
        totalAmount: payment.totalAmount,
        paidAt: payment.paidAt,
        note: payment.note,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        minSpentAt,
        maxSpentAt,
        expenseCount: spentDates.length,
      });
    });
  }
}

export default ResponsePaymentBySelectedExpenseMapper;
