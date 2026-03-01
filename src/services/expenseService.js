import expenseRepository from "../repositories/expenseRepository.js";
import cache from "../configs/cache.js";
import ResponseExpenseMapper from "../utils/mappers/responseMappers/responseExpenseMapper.js";

class ExpenseService {
  async createExpense(data) {
    const finalAmount = data.isSplitBill
      ? Math.floor(data.amount / 2)
      : data.amount;
    const expense = await expenseRepository.create({ ...data, finalAmount });
    this.invalidateCache();

    return ResponseExpenseMapper.toPlainObject(expense);
  }

  async getAllExpensesWithPaymentPaidAtResponse({ page = 1, limit = 10 }) {
    const parsedPage = Number.parseInt(page);
    const parsedLimit = Number.parseInt(limit);

    const offset = (parsedPage - 1) * parsedLimit;

    const result = await expenseRepository.findAllWithPayment({
      limit: parsedLimit,
      offset,
    });

    const mapped = result.data.map(
      ResponseExpenseMapper.toExpenseResponseWithSpecificPayment,
    );

    return {
      expenses: mapped,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      },
    };
  }

  async getAllExpenses(filters) {
    const { page = 1, limit = 10, ...otherFilters } = filters;

    const offset = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      expenseRepository.findAll({
        ...otherFilters,
        limit: Number.parseInt(limit),
        offset,
      }),
      expenseRepository.count(otherFilters),
    ]);

    const expenseResponse = ResponseExpenseMapper.toResponseArray(expenses);

    return {
      expenseResponse,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getExpenseById(id) {
    const expense = await expenseRepository.findById(id);

    if (!expense) {
      const error = new Error("Expense not found");
      error.statusCode = 404;
      throw error;
    }

    return ResponseExpenseMapper.toResponseWithPayment(expense);
  }

  async updateExpense(id, data) {
    await this.getExpenseById(id);
    const updatedExpense = await expenseRepository.update(id, data);
    this.invalidateCache();
    return ResponseExpenseMapper.toPlainObject(updatedExpense);
  }

  async deleteExpense(id) {
    await this.getExpenseById(id);
    const deletedExpense = await expenseRepository.delete(id);
    this.invalidateCache();
    return deletedExpense;
  }

  async getCategoryStats() {
    const stats = await expenseRepository.getTotalByCategory();

    return stats.map((stat) => ({
      category: stat.category,
      totalAmount: stat._sum.amount || 0,
      count: stat._count.id,
    }));
  }

  async getMonthlyReport(year, month) {
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      const error = new Error("Tahun atau bulan tidak valid");
      error.statusCode = 400;
      throw error;
    }

    const grouped = await expenseRepository.getMonthlyStats(year, month);

    let paidAmount = 0;
    let unpaidAmount = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    for (const row of grouped) {
      if (row.isPaid) {
        paidAmount = row._sum.finalAmount ?? 0;
        paidCount = row._count.id ?? 0;
      } else {
        unpaidAmount = row._sum.finalAmount ?? 0;
        unpaidCount = row._count.id ?? 0;
      }
    }

    const totalAmount = paidAmount + unpaidAmount;
    const totalCount = paidCount + unpaidCount;

    const report = {
      year,
      month,
      totalAmount,
      paidAmount,
      unpaidAmount,
      totalCount,
      paidCount,
      unpaidCount,
    };

    return ResponseExpenseMapper.toMonthlyReportResponse(report);
  }

  invalidateCache() {
    const keys = cache.keys();
    keys.forEach((key) => {
      if (key.startsWith("cache_")) {
        cache.del(key);
      }
    });
    console.log("Cache invalidated");
  }

  async getTotalExpense(type) {
    let isPaid = null;

    if (type === "paid") isPaid = true;
    else if (type === "unpaid") isPaid = false;
    else if (type !== undefined) {
      const error = new Error("type harus 'paid' atau 'unpaid'");
      error.statusCode = 400;
      throw error;
    }

    const totalExpense = await expenseRepository.getTotalExpense(isPaid);
    return { totalExpense };
  }
}

export default new ExpenseService();
