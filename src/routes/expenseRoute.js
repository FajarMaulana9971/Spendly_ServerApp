const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const cacheMiddleware = require('../middlewares/cacheMiddleware');
const validateCreateMiddleware = require('../middlewares/validations/expense-create.middleware.');
const validateUpdateMiddleware = require('../middlewares/validations/expense-update.middleware');

router.get('/', cacheMiddleware(300), expenseController.getAll);

router.get('/stats/category', cacheMiddleware(300), expenseController.getCategoryStats);

router.get('/stats/monthly/:year/:month', cacheMiddleware(300), expenseController.getMonthlyReport);

router.get('/:id', cacheMiddleware(300), expenseController.getById);

router.post('/', validateCreateMiddleware, expenseController.create);

router.put('/:id', validateUpdateMiddleware, expenseController.update);

router.delete('/:id', expenseController.delete);

module.exports = router;