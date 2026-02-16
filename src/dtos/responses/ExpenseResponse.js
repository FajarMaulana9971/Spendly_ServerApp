export const ExpenseResponse = ({
                                    id,
                                    title,
                                    amount,
                                    finalAmount,
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
    finalAmount,
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