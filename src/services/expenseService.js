const expenseRepository = require('../repositories/expenseRepository');
const cache = require('../configs/cache');

class ExpenseService {
    async createExpense(data) {
        const expense = await expenseRepository.create(data);
        this.invalidateCache();
        return expense;
    }

    async getAllExpenses(filters) {
        const {page = 1, limit = 10, ...otherFilters} = filters;

        const offset = (page - 1) * limit;

        const [expenses, total] = await Promise.all([
            expenseRepository.findAll({...otherFilters, limit: Number.parseInt(limit), offset}),
            expenseRepository.count(otherFilters)
        ]);

        return {
            expenses,
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

        return expense;
    }

    async updateExpense(id, data) {
        await this.getExpenseById(id);
        const updatedExpense = await expenseRepository.update(id, data);
        this.invalidateCache();
        return updatedExpense;
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
        return await expenseRepository.getMonthlyStats(year, month);
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

module.exports = new ExpenseService();