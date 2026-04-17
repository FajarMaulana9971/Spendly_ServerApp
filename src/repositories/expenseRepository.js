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

  async findAllWithPayment({
    limit = 10,
    offset = 0,
    sortBy = "spentAt",
    sortOrder = "desc",
  }) {
    const [rows, total] = await prisma.$transaction([
      prisma.expense.findMany({
        orderBy: {
          [sortBy]: sortOrder,
        },
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          amount: true,
          finalAmount: true,
          category: true,
          isPaid: true,
          isSplitBill: true,
          spentAt: true,
          paidAt: true,
          // payment: {
          //     select: {
          //         paidAt: true
          //     }
          // }
        },
      }),
      prisma.expense.count(),
    ]);

    const data = rows.map((e) => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      finalAmount: e.finalAmount,
      category: e.category,
      isPaid: e.isPaid,
      isSplitBill: e.isSplitBill,
      spentAt: e.spentAt,
      paidAt: e.paidAt,
      // paymentPaidAt: e.paidAt,
    }));

    return {
      data,
      pagination: {
        total,
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAll(filters = {}) {
    const {
      category,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
      limit,
      offset,
      paid,
    } = filters;

    const where = {};

    if (category) {
      where.category = category;
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
    const { category, startDate, endDate } = filters;

    const where = {};

    if (category) {
      where.category = category;
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

  async getExpenseWhereIsPaidIsFalse() {
    const where = {
      isPaid: false,
      paidAt: null,
    };

    const [rows, total] = await prisma.$transaction([
      prisma.expense.findMany({
        where,
        orderBy: {
          id: "asc",
        },
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
      }),
      prisma.expense.count({ where }),
    ]);

    return {
      data: rows,
      pagination: {
        total,
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
      },
    };
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
}

export default new ExpenseRepository();
