import ExpenseResponse from "../../../dtos/responses/expenseResponse.js";
import ExpenseResponseWithSpecificPaymentResponse from "../../../dtos/responses/expenseResponseWithSpecificPayment.js";
import MonthlyReportResponse from "../../../dtos/responses/monthlyReportResponse";

class ResponseExpenseMapper {
  static toResponse(expense) {
    if (!expense) return null;

    return ExpenseResponse({
      id: expense.id?.toString(),
      title: expense.title,
      amount: expense.amount,
      finalAmount: expense.finalAmount,
      category: expense.category,
      note: expense.note,
      isPaid: expense.isPaid,
      isSplitBill: expense.isSplitBill,
      spentAt: expense.spentAt,
      paymentId: expense.paymentId?.toString() || null,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    });
  }

  static toExpenseResponseWithSpecificPayment(expense) {
    if (!expense) return null;

    return ExpenseResponseWithSpecificPaymentResponse({
      id: expense.id?.toString(),
      title: expense.title,
      amount: expense.amount,
      finalAmount: expense.finalAmount,
      category: expense.category,
      isPaid: expense.isPaid,
      isSplitBill: expense.isSplitBill,
      spentAt: expense.spentAt,
      paymentPaidAt: expense.paidAt,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    });
  }

  static toResponseArray(expenses) {
    if (!Array.isArray(expenses)) return [];
    return expenses.map((expense) => this.toResponse(expense));
  }

  static toPlainObject(expense) {
    if (!expense) return null;

    return {
      id: expense.id.toString(),
      title: expense.title,
      amount: expense.amount,
      finalAmount: expense.finalAmount,
      category: expense.category,
      note: expense.note,
      isPaid: expense.isPaid,
      isSplitBill: expense.isSplitBill,
      spentAt: expense.spentAt,
      paymentId: expense.payment?.id?.toString() || null,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    };
  }

  static toPlainObjectArray(expenses) {
    if (!expenses || !Array.isArray(expenses)) return [];

    const length = expenses.length;
    const result = new Array(length);

    for (let i = 0; i < length; i++) {
      const expense = expenses[i];
      result[i] = {
        id: expense.id.toString(),
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        note: expense.note,
        spentAt: expense.spentAt,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
      };
    }

    return result;
  }

  static toMonthlyReportResponse(report) {
    if (!report) return null;

    const totalAmount = report.paidAmount + report.unpaidAmount;
    const totalCount = report.paidCount + report.unpaidCount;

    return MonthlyReportResponse({
      year: report.year,
      month: report.month,
      totalAmount,
      paidAmount: report.paidAmount,
      unpaidAmount: report.unpaidAmount,
      totalCount,
      paidCount: report.paidCount,
      unpaidCount: report.unpaidCount,
    });
  }
}

export default ResponseExpenseMapper;
