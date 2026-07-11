import expenseRepository from "../repositories/expenseRepository.js";
import redisClient from "../configs/cache.js";
import ResponseExpenseMapper from "../utils/mappers/responseMappers/responseExpenseMapper.js";

class ExpenseService {
  async createExpense(data) {
    const finalAmount = data.isSplitBill
      ? Math.floor(data.amount / 2)
      : data.amount;
    const expense = await expenseRepository.create({ ...data, finalAmount });
    await this.invalidateCache();

    return ResponseExpenseMapper.toPlainObject(expense);
  }

  /**
   * Pagination di sini berbasis TANGGAL UNIK (header), bukan berbasis baris expense.
   * `limit` = jumlah hari per halaman. Response tetap berupa list flat expense,
   * tapi isinya adalah seluruh transaksi dari N hari yang dipilih untuk halaman ini
   * (jumlah barisnya bisa lebih dari `limit`, tergantung banyak transaksi per hari).
   *
   * sortBy/sortOrder untuk field selain 'spentAt' hanya mengurutkan transaksi
   * DI DALAM hari yang sama — urutan hari (dan hari mana yang masuk halaman berapa)
   * tetap mengikuti spentAt + sortOrder, supaya satu hari tidak pernah terpotong
   * di dua halaman berbeda.
   */
  async getAllExpenses(filters) {
    const {
      page = 1,
      limit = 10,
      sortBy = "spentAt",
      sortOrder = "desc",
      ...otherFilters
    } = filters;

    const parsedLimit = Number.parseInt(limit);
    const parsedPage = Number.parseInt(page);
    const offset = (parsedPage - 1) * parsedLimit;

    const [dateRows, totalDates, totalItems] = await Promise.all([
      expenseRepository.findDistinctDates({
        ...otherFilters,
        sortOrder,
        limit: parsedLimit,
        offset,
      }),
      expenseRepository.countDistinctDates(otherFilters),
      expenseRepository.count(otherFilters),
    ]);

    const dates = dateRows.map((d) => d.spentAt);

    const expenses = await expenseRepository.findAllByDates(dates, {
      ...otherFilters,
      sortBy,
      sortOrder,
    });

    const expenseResponse = ResponseExpenseMapper.toResponseArray(expenses);

    return {
      expenseResponse,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: totalDates, // total hari (header) yang cocok dengan filter
        totalPages: Math.max(Math.ceil(totalDates / parsedLimit), 1),
        totalItems, // total transaksi (semua item) yang cocok dengan filter
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

  async updateExpense(id, request) {
    const existing = await this.getExpenseById(id);

    const amount =
      request.amount !== undefined ? request.amount : existing.amount;

    const isSplitBill =
      request.isSplitBill !== undefined
        ? request.isSplitBill
        : existing.isSplitBill;

    const finalAmount = isSplitBill ? amount / 2 : amount;

    const finalData = {
      ...request,
      amount,
      isSplitBill,
      finalAmount,
    };

    const updatedExpense = await expenseRepository.update(id, finalData);

    await this.invalidateCache();

    return ResponseExpenseMapper.toPlainObject(updatedExpense);
  }

  async createDailyBulk(request) {
    const { expenses } = request;

    if (!expenses || !Array.isArray(expenses)) {
      const error = new Error("expenses harus array");
      error.statusCode = 400;
      throw error;
    }

    const result = await expenseRepository.createBulkExpense(expenses);

    await this.invalidateCache();
    return {
      inserted: result.count,
    };
  }

  async getDailyStatus(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const expenses = await expenseRepository.getDailyExpensesStatus(start, end);

    const map = new Map();

    for (const e of expenses) {
      const date = e.spentAt.toLocaleDateString("sv-SE");

      if (!map.has(date)) {
        map.set(date, {
          date,
          exists: false,
        });
      }

      if (e.category === "Harian") {
        map.get(date).exists = true;
      }
    }

    return Array.from(map.values());
  }

  async getExpenseWhereIsPaidIsFalse(filters = {}) {
    const result = await expenseRepository.getExpenseWhereIsPaidIsFalse(filters);
    return result.map(expense =>
      ResponseExpenseMapper.expensForPaymentResponse(expense)
    );
  }

  async deleteExpense(id) {
    await this.getExpenseById(id);
    const deletedExpense = await expenseRepository.delete(id);
    await this.invalidateCache();
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

  async invalidateCache() {
    try {
      if (!redisClient.isOpen) return;

      // Scan and delete all keys with prefix "cache_"
      let cursor = 0;
      let deletedCount = 0;

      do {
        const reply = await redisClient.scan(cursor, {
          MATCH: "cache_*",
          COUNT: 100,
        });
        cursor = reply.cursor;

        if (reply.keys.length > 0) {
          await redisClient.del(reply.keys);
          deletedCount += reply.keys.length;
        }
      } while (cursor !== 0);

      console.log(`🗑️ Cache invalidated: ${deletedCount} keys deleted`);
    } catch (err) {
      console.error("❌ Cache invalidation error:", err.message);
    }
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