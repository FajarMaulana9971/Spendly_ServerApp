import express from 'express'
import expenseController from '../controllers/expenseController.js'
import cacheMiddleware from '../middlewares/cacheMiddleware.js'
import validateCreateExpense from '../middlewares/validations/expense-create.middleware.js'
import validateUpdateExpense from '../middlewares/validations/expense-update.middleware.js'

const router = express.Router();

router.get('/expense', cacheMiddleware(300), expenseController.getAll);

router.get('/expense/stats/category', cacheMiddleware(300), expenseController.getCategoryStats);

router.get('/expense/stats/monthly/:year/:month', cacheMiddleware(300), expenseController.getMonthlyReport);

router.get('/expense/:id', cacheMiddleware(300), expenseController.getById);

router.post('/expense', validateCreateExpense, expenseController.create);

router.put('/expense/:id', validateUpdateExpense, expenseController.update);

router.delete('/expense/:id', expenseController.delete);

export default router;
