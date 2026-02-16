import ExpenseResponse from '../../../dtos/responses/ExpenseResponse.js';

class ResponseExpenseMapper {
    static toResponse(expense) {
        if (!expense) return null;

        return ExpenseResponse({
            id: expense.id.toString(),
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            note: expense.note,
            spentAt: expense.spentAt,
            createdAt: expense.createdAt,
            updatedAt: expense.updatedAt
        });
    }

    static toResponseArray(expenses) {
        if (!expenses || !Array.isArray(expenses)) return [];

        const length = expenses.length;
        const result = new Array(length);

        for (let i = 0; i < length; i++) {
            const expense = expenses[i];
            result[i] = ExpenseResponse({
                id: expense.id.toString(),
                title: expense.title,
                amount: expense.amount,
                category: expense.category,
                note: expense.note,
                spentAt: expense.spentAt,
                createdAt: expense.createdAt,
                updatedAt: expense.updatedAt
            });
        }

        return result;
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
            updatedAt: expense.updatedAt
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
                updatedAt: expense.updatedAt
            };
        }

        return result;
    }
}

export default ResponseExpenseMapper;