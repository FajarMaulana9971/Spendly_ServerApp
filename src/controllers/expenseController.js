import expenseService from '../services/expenseService.js'
import BaseResponse from '../dtos/responses/base/baseResponse.js'
import RequestExpenseMapper from "../utils/mappers/requestMappers/requestExpenseMapper.js";

class ExpenseController {
    async create(req, res, next) {
        try {
            const request = RequestExpenseMapper.toEntity(req.body)
            const expense = await expenseService.createExpense(request);
            res.status(201).json(BaseResponse.success(expense, 'Expense created successfully'));
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const {page, limit, category, startDate, endDate, sortBy, sortOrder} = req.query;

            const filters = {
                page, limit, category, startDate, endDate, sortBy, sortOrder
            };

            const result = await expenseService.getAllExpenses(filters);
            res.json(BaseResponse.success(result));
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const expense = await expenseService.getExpenseById(req.params.id);
            res.json(BaseResponse.success(expense));
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const request = RequestExpenseMapper.toEntity(req.body)
            const expense = await expenseService.updateExpense(req.params.id, request);
            res.json(BaseResponse.success(expense, 'Expense updated successfully'));
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await expenseService.deleteExpense(req.params.id);
            res.json(BaseResponse.success(null, 'Expense deleted successfully'));
        } catch (error) {
            next(error);
        }
    }

    async getCategoryStats(req, res, next) {
        try {
            const stats = await expenseService.getCategoryStats();
            res.json(BaseResponse.success(stats));
        } catch (error) {
            next(error);
        }
    }

    async getMonthlyReport(req, res, next) {
        try {
            const {year, month} = req.params;
            const report = await expenseService.getMonthlyReport(Number.parseInt(year), Number.parseInt(month));
            res.json(BaseResponse.success(report));
        } catch (error) {
            next(error);
        }
    }
}

export default new ExpenseController();