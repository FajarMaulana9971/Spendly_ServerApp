function validateCreateExpense(req, res, next) {
    const {amount, category, date} = req.body;

    if (amount == null) {
        return res.status(400).json({message: 'amount is required'});
    }

    if (!category) {
        return res.status(400).json({message: 'category is required'});
    }

    if (!date) {
        return res.status(400).json({message: 'date is required'});
    }

    next();
}

export default validateCreateExpense;
