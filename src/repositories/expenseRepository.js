import prisma from "../configs/database.js";

class ExpenseRepository {
  async create(data) {
    return prisma.expense.create({
      data: {
        title: data.title,
        amount: data.amount,
        finalAmount: data.finalAmount,
        category: data.category,
        note: data.note || null,
        isPaid: data.isPaid,
        isSplitBill: data.isSplitBill,
        spentAt: new Date(data.spentAt),
      },
    });
  }

  async findAll(filters = {}) {
    const {
      title,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
      limit,
      offset,
      paid,
    } = filters;

    const where = {};

    if (title) {
      where.title={
        contains: title,
        mode: 'insensitive'
      }
    }

    if (startDate || endDate) {
      where.spentAt = {};
      if (startDate) {
        where.spentAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.spentAt.lte = new Date(endDate);
      }
    }

    if (paid != undefined) {
      where.isPaid = paid === "true";
    }

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    return prisma.expense.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
    });
  }

  /**
   * Membangun `where` clause dari filters umum (title, startDate, endDate, paid).
   * Dipakai bareng oleh findDistinctDates, countDistinctDates, dan findAllByDates
   * supaya kondisi filter selalu konsisten di ketiganya.
   */
  _buildDateFilterWhere(filters = {}) {
    const { title, startDate, endDate, paid } = filters;
    const where = {};

    if (title) {
      where.title = {
        contains: title,
        mode: "insensitive",
      };
    }

    if (startDate || endDate) {
      where.spentAt = {};
      if (startDate) where.spentAt.gte = new Date(startDate);
      if (endDate) where.spentAt.lte = new Date(endDate);
    }

    if (paid != undefined) {
      where.isPaid = paid === "true";
    }

    return where;
  }

  /**
   * Ambil N tanggal unik (spentAt) sesuai filter, untuk keperluan pagination
   * berbasis hari/header (bukan berbasis baris expense).
   */
  async findDistinctDates(filters = {}) {
    const { sortOrder = "desc", limit, offset } = filters;
    const where = this._buildDateFilterWhere(filters);

    return prisma.expense.findMany({
      where,
      distinct: ["spentAt"],
      select: { spentAt: true },
      orderBy: { spentAt: sortOrder },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Total tanggal unik yang cocok dengan filter (dipakai untuk totalPages).
   */
  async countDistinctDates(filters = {}) {
    const where = this._buildDateFilterWhere(filters);

    const dates = await prisma.expense.findMany({
      where,
      distinct: ["spentAt"],
      select: { spentAt: true },
    });

    return dates.length;
  }

  /**
   * Ambil semua expense untuk sekumpulan tanggal tertentu (satu halaman = N hari).
   * sortBy/sortOrder di sini hanya mengurutkan transaksi DI DALAM tanggal yang sama;
   * urutan tanggal itu sendiri tetap mengikuti findDistinctDates.
   */
  async findAllByDates(dates, filters = {}) {
    const { title, paid, sortBy = "spentAt", sortOrder = "desc" } = filters;

    if (!dates || dates.length === 0) return [];

    const where = { spentAt: { in: dates } };

    if (title) {
      where.title = {
        contains: title,
        mode: "insensitive",
      };
    }

    if (paid != undefined) {
      where.isPaid = paid === "true";
    }

    const orderBy =
      sortBy === "spentAt"
        ? { spentAt: sortOrder }
        : [{ spentAt: sortOrder }, { [sortBy]: sortOrder }];

    return prisma.expense.findMany({
      where,
      orderBy,
    });
  }

  async findById(id) {
    return prisma.expense.findUnique({
      where: { id },
      include: {
        payment: true,
      },
    });
  }

  async update(id, data) {
    const updateData = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.finalAmount !== undefined)
      updateData.finalAmount = data.finalAmount;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.note !== undefined) updateData.note = data.note;
    if (data.isSplitBill != undefined)
      updateData.isSplitBill = data.isSplitBill;
    if (data.spentAt !== undefined) updateData.spentAt = new Date(data.spentAt);

    return prisma.expense.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id) {
    return prisma.expense.delete({
      where: { id },
    });
  }

  async getTotalByCategory() {
    return prisma.expense.groupBy({
      by: ["category"],
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
    });
  }

  async getMonthlyStats(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const grouped = await prisma.expense.groupBy({
      by: ["isPaid"],
      where: {
        spentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        finalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    return grouped;
  }

  async count(filters = {}) {
    const { title, startDate, endDate, paid } = filters;
    const where = {};

    if (title) {
      where.title = {
        contains: title,
        mode: 'insensitive',
      };
    }

    if (startDate || endDate) {
      where.spentAt = {};
      if (startDate) where.spentAt.gte = new Date(startDate);
      if (endDate) where.spentAt.lte = new Date(endDate);
    }

    if (paid != undefined) {
      // FIX: sebelumnya `paid === 'false'` (kebalik), harusnya sama seperti
      // findAll/findAllByDates supaya total count konsisten dengan filter status.
      where.isPaid = paid === 'true';
    }

    return prisma.expense.count({ where });
  }

  async findUnpaidByIds(tx, expenseIds) {
    return tx.expense.findMany({
      where: {
        id: { in: expenseIds },
        isPaid: false,
      },
    });
  }

  async updateExpensesAsPaid(tx, expenseIds, paymentId, paidAt) {
    return tx.expense.updateMany({
      where: {
        id: { in: expenseIds },
        isPaid: false,
      },
      data: {
        isPaid: true,
        paidAt,
        paymentId,
      },
    });
  }

  async getExpenseWhereIsPaidIsFalse(filters = {}) {
    const { startDate, endDate } = filters;
    const where = { isPaid: false, paidAt: null };

    if (startDate || endDate) {
      where.spentAt = {};
      if (startDate) where.spentAt.gte = new Date(startDate);
      if (endDate) where.spentAt.lte = new Date(endDate);
    }

    return prisma.expense.findMany({
      where,
      orderBy: { spentAt: "asc" },
      select: {
        id: true,
        title: true,
        amount: true,
        finalAmount: true,
        category: true,
        isSplitBill: true,
        spentAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
  
  async getTotalExpense(isPaid = null) {
    const where = {};
    if (isPaid !== null) where.isPaid = isPaid;

    const result = await prisma.expense.aggregate({
      where,
      _sum: { finalAmount: true },
    });

    return result._sum.finalAmount ?? 0;
  }

  async createBulkExpense(expenses) {
    const formatted = expenses.map((e) => ({
      title: e.title,
      amount: e.amount,
      finalAmount: e.amount,
      category: e.category,
      note: e.note,
      isSplitBill: e.isSplitBill ?? false,
      spentAt: new Date(e.spentAt),
    }));

    const result = await prisma.expense.createMany({
      data: formatted,
      skipDuplicates: true,
    });

    return result;
  }

  async getDailyExpensesStatus(startDate, endDate) {
    const expenses = await prisma.expense.findMany({
      where: {
        isPaid: false,
        spentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        spentAt: true,
        category: true,
      },
      orderBy: {
        spentAt: "asc",
      },
    });

    return expenses;
  }

  async findUnpaidForAmountSearch(maxAmount) {
    return prisma.expense.findMany({
      where: {
        isPaid: false,
        paidAt: null,
        finalAmount: { lte: maxAmount },
      },
      orderBy: { finalAmount: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        amount: true,
        finalAmount: true,
        isSplitBill: true,
        spentAt: true,
      },
    });
  }
}


export default new ExpenseRepository();