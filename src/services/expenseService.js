import expenseRepository from '../repositories/expenseRepository.js'
import cache from '../configs/cache.js'
import ResponseExpenseMapper from "../utils/mappers/responseMappers/responseExpenseMapper.js";

class ExpenseService {
    async createExpense(data) {

        const finalAmount = data.isSplitBill ? Math.floor(data.amount / 2) : data.amount;
        const expense = await expenseRepository.create({...data, finalAmount});
        this.invalidateCache()

        return ResponseExpenseMapper.toPlainObject(expense);
    }

    async getAllExpenses(filters) {
        const {page = 1, limit = 10, ...otherFilters} = filters;

        const offset = (page - 1) * limit;

        const [expenses, total] = await Promise.all([
            expenseRepository.findAll({...otherFilters, limit: Number.parseInt(limit), offset}),
            expenseRepository.count(otherFilters)
        ]);

        const expenseResponse = ResponseExpenseMapper.toPlainObjectArray(expenses)

        return {
            expenseResponse,
            pagination: {
                page: Number.parseInt(page),
                limit: Number.parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getExpenseById(id) {
        const expense = await expenseRepository.findById(id);

        if (!expense) {
            const error = new Error('Expense not found');
            error.statusCode = 404;
            throw error;
        }

        return ResponseExpenseMapper.toPlainObject(expense);
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

        return stats.map(stat => ({
            category: stat.category,
            totalAmount: stat._sum.amount || 0,
            count: stat._count.id
        }));
    }

    async getMonthlyReport(year, month) {
        const report = await expenseRepository.getMonthlyStats(year, month);

        return {
            expenses: ResponseExpenseMapper.toPlainObjectArray(report.expenses),
            totalAmount: report.totalAmount,
            totalCount: report.totalCount
        };
    }
    invalidateCache() {
        const keys = cache.keys();
        keys.forEach(key => {
            if (key.startsWith('cache_')) {
                cache.del(key);
            }
        });
        console.log('Cache invalidated');
    }
}

export default new ExpenseService()