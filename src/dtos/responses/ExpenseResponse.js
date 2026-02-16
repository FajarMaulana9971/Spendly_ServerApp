export const ExpenseResponse = ({
                                    id,
                                    title,
                                    amount,
                                    actualAmount,
                                    category,
                                    note,
                                    isPaid,
                                    isSplitBill,
                                    spentAt,
                                    paymentId,
                                    createdAt,
                                    updatedAt
                                }) => ({
    id,
    title,
    amount,
    actualAmount,
    category,
    note,
    isPaid,
    isSplitBill,
    spentAt,
    paymentId,
    createdAt,
    updatedAt
});

export default ExpenseResponse;