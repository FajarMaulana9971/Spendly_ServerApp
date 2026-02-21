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
      category,
      startDate,
      endDate,
      sortBy = "spentAt",
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
    });
  }

  async update(id, data) {
    const updateData = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.note !== undefined) updateData.note = data.note;
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
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [expenses, stats] = await Promise.all([
      prisma.expense.findMany({
        where: {
          spentAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          spentAt: "desc",
        },
      }),
      prisma.expense.aggregate({
        where: {
          spentAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    return {
      expenses,
      totalAmount: stats._sum.amount || 0,
      totalCount: stats._count.id || 0,
    };
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
}

export default new ExpenseRepository();
