import prisma from "../configs/database.js"
import paymentRepository from "../repositories/paymentRepository.js"
import expenseRepository from "../repositories/expenseRepository.js"

class PaymentService {

    async payBySelectedExpenses(request) {

        const { totalAmount, paidAt, note, expenseIds } = request

        if (!expenseIds || expenseIds.length === 0) {
            throw new Error("Expense IDs cannot be empty")
        }

        return prisma.$transaction(async (tx) => {

            const expenses = await expenseRepository.findUnpaidByIds(tx, expenseIds)

            if (expenses.length !== expenseIds.length) {
                throw new Error("Some expenses are already paid or not found")
            }

            const calculatedTotal = expenses.reduce((sum, e) => sum + e.totalAmount, 0)

            if (calculatedTotal !== totalAmount) {
                throw new Error("Total amount mismatch")
            }

            const payment = await paymentRepository.create(tx, {
                totalAmount,
                paidAt: paidAt ? new Date(paidAt) : new Date(),
                note
            })

            await expenseRepository.updateExpensesAsPaid(
                tx,
                expenseIds,
                payment.id,
                payment.paidAt
            )

            return tx.payment.findUnique({
                where: {id: payment.id},
                include: {expenses: true}
            });
        })


    }

}

export default new PaymentService()
