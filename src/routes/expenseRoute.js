import express from 'express'
import expenseController from '../controllers/expenseController.js'
import cacheMiddleware from '../middlewares/cacheMiddleware.js'
import validateCreateExpense from '../middlewares/validations/expense-create.middleware.js'
import validateUpdateExpense from '../middlewares/validations/expense-update.middleware.js'

const expenseRouter = express.Router();

expenseRouter.get('/expense', cacheMiddleware(300), expenseController.getAll);

expenseRouter.get('/expense/stats/category', cacheMiddleware(300), expenseController.getCategoryStats);

expenseRouter.get('/expense/stats/monthly/:year/:month', cacheMiddleware(300), expenseController.getMonthlyReport);

expenseRouter.get('/expense/:id', cacheMiddleware(300), expenseController.getById);

expenseRouter.post('/expense', validateCreateExpense, expenseController.create);

expenseRouter.put('/expense/:id', validateUpdateExpense, expenseController.update);

expenseRouter.delete('/expense/:id', expenseController.delete);

export default expenseRouter;
