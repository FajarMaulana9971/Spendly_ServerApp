import prisma from "../configs/database.js";

class PaymentRepository {
  async create(tx, data) {
    return tx.payment.create({ data });
  }

  async findAll(filters = {}) {
    const {
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
      limit,
      offset,
    } = filters;
    const where = {};

    if (startDate || endDate) {
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.updatedAt.lte = new Date(endDate);
      }
    }

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    return prisma.payment.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
    });
  }

  async count(filters = {}) {
    const { startDate, endDate } = filters;

    const where = {};

    if (startDate || endDate) {
      where.spentAt = {};
      if (startDate) {
        where.spentAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.spentAt.lte = new Date(endDate);
      }
    }

    return prisma.payment.count({ where });
  }

  async findByIdWithExpenses(id) {
    return prisma.payment.findUnique({
      where: { id: BigInt(id) },
      select: {
        id: true,
        totalAmount: true,
        paidAt: true,
        note: true,
        createdAt: true,
        updatedAt: true,
        expenses: {
          select: {
            id: true,
            title: true,
            amount: true,
            finalAmount: true,
            category: true,
            note: true,
            isPaid: true,
            isSplitBill: true,
            spentAt: true,
            paymentId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }
}

export default new PaymentRepository();
