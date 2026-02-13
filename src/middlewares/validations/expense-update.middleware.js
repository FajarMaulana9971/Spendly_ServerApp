module.exports = (req, res, next) => {
    const { amount } = req.body;

    if (amount != null && amount <= 0) {
        return res.status(400).json({ message: 'amount must be positive' });
    }

    next();
};
