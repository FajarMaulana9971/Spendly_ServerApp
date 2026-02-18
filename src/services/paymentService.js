import prisma from "../configs/database.js";
import paymentRepository from "../repositories/paymentRepository.js";
import expenseRepository from "../repositories/expenseRepository.js";
import ResponseExpenseMapper from "../utils/mappers/responseMappers/responseExpenseMapper.js";
import ResponsePaymentBySelectedExpenseMapper from "../utils/mappers/responseMappers/responsePaymentMapper.js";

class PaymentService {
  async payBySelectedExpenses(request) {
    const { totalAmount, paidAt, note, expenseIds } = request;

    if (!expenseIds || expenseIds.length === 0) {
      throw new Error("Expense IDs cannot be empty");
    }

    return prisma.$transaction(async (tx) => {
      const expenses = await expenseRepository.findUnpaidByIds(tx, expenseIds);

      if (expenses.length !== expenseIds.length) {
        throw new Error("Some expenses are already paid or not found");
      }

      const calculatedTotal = expenses.reduce(
        (sum, e) => sum + e.finalAmount,
        0,
      );

      if (calculatedTotal !== totalAmount) {
        throw new Error("Total amount mismatch");
      }

      const payment = await paymentRepository.create(tx, {
        totalAmount,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        note,
      });

      await expenseRepository.updateExpensesAsPaid(
        tx,
        expenseIds,
        payment.id,
        payment.paidAt,
      );

      const paymentWithExpenses = await tx.payment.findUnique({
        where: { id: payment.id },
        include: { expenses: true },
      });

      return ResponsePaymentBySelectedExpenseMapper.mappingForSpecificPayment(
        paymentWithExpenses,
      );
    });
  }

  async getAllPayments(filters) {
    const { page = 1, limit = 10, ...otherFilters } = filters;

    const offset = (page - 1) * limit;

    const [payment, total] = await Promise.all([
      paymentRepository.findAll({
        ...otherFilters,
        limit: Number.parseInt(limit),
        offset,
      }),
      paymentRepository.count(otherFilters),
    ]);

    const paymentResponse =
      ResponsePaymentBySelectedExpenseMapper.mappingForUnSpecificPayment(
        payment,
      );

    return {
      paymentResponse,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPaymentById(id) {
    if (!id) {
      throw new Error("Payment Id Is Required");
    }
    const payment = await paymentRepository.findByIdWithExpenses(id);

    if (!payment) {
      throw new Error("Payment is not found");
    }

    return ResponsePaymentBySelectedExpenseMapper.mappingForSpecificPayment(
      payment,
    );
  }
}

export default new PaymentService();
