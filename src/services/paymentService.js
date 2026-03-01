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

    const payments =
      ResponsePaymentBySelectedExpenseMapper.mappingForUnSpecificPayment(
        payment,
      );

    return {
      payments,
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

  async getMonthlyReport(year, month) {
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      const error = new Error("Tahun atau bulan tidak valid");
      error.statusCode = 400;
      throw error;
    }

    const { expenses } = await expenseRepository.getMonthlyStats(year, month);

    // ---- Agregasi summary keseluruhan ----
    let totalAmount = 0;
    let paidAmount = 0;
    let unpaidAmount = 0;

    // ---- Siapkan dailyMap untuk semua hari di bulan itu ----
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyMap = {};

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      dailyMap[dateStr] = {
        date: dateStr,
        paidAmount: 0,
        unpaidAmount: 0,
        totalAmount: 0,
      };
    }

    // ---- Isi dailyMap dari data expense ----
    for (const exp of expenses) {
      const effectiveAmount = exp.finalAmount ?? exp.amount;
      const isPaid = exp.isPaid || exp.paymentId !== null;

      totalAmount += effectiveAmount;

      const d = exp.spentAt;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      if (dailyMap[dateStr]) {
        dailyMap[dateStr].totalAmount += effectiveAmount;

        if (isPaid) {
          paidAmount += effectiveAmount;
          dailyMap[dateStr].paidAmount += effectiveAmount;
        } else {
          unpaidAmount += effectiveAmount;
          dailyMap[dateStr].unpaidAmount += effectiveAmount;
        }
      }
    }

    return {
      year,
      month,
      totalAmount,
      paidAmount,
      unpaidAmount,
      expenseCount: expenses.length,
      daily: Object.values(dailyMap),
    };
  }

  async getTotalPaid() {
    const totalAmount = await paymentRepository.getTotalPaid();
    return { totalAmount };
  }
}

export default new PaymentService();
