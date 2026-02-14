import express from 'express'
import expenseController from '../controllers/expenseController.js'
import cacheMiddleware from '../middlewares/cacheMiddleware.js'
import validateCreateExpense from '../middlewares/validations/expense-create.middleware.js'
import validateUpdateExpense from '../middlewares/validations/expense-update.middleware.js'

const router = express.Router();

router.get('/', cacheMiddleware(300), expenseController.getAll);

router.get('/stats/category', cacheMiddleware(300), expenseController.getCategoryStats);

router.get('/stats/monthly/:year/:month', cacheMiddleware(300), expenseController.getMonthlyReport);

router.get('/:id', cacheMiddleware(300), expenseController.getById);

router.post('/', validateCreateExpense, expenseController.create);

router.put('/:id', validateUpdateExpense, expenseController.update);

router.delete('/:id', expenseController.delete);

export default router;