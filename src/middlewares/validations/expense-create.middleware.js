const validateCreateExpense = (req, res, next) => {
    const { title, amount, category, spentAt } = req.body;
    const errors = [];

    if (typeof title !== 'string' || title.trim() === '') {
        errors.push('Title is required and must be a valid string');
    }

    if (typeof amount !== 'number' || amount <= 0) {
        errors.push('Amount must be a number greater than 0');
    }

    if (typeof category !== 'string' || category.trim() === '') {
        errors.push('Category is required and must be a valid string');
    }

    if (spentAt) {
        const date = new Date(spentAt);
        if (Number.isNaN(date.getTime())) {
            errors.push('Invalid date format for spentAt. Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)');
        }
    } else {
        errors.push('SpentAt date is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            data: null,
            message: errors.join(', ')
        });
    }

    next();
};

export default validateCreateExpense;