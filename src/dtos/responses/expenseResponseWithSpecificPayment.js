export const ExpenseResponseWithSpecificPaymentResponse = ({
                                                               id,
                                                               title,
                                                               amount,
                                                               finalAmount,
                                                               category,
                                                               isPaid,
                                                               isSplitBill,
                                                               spentAt,
                                                               paymentPaidAt,
                                                           }) => ({
    id,
    title,
    amount,
    finalAmount,
    category,
    isPaid,
    isSplitBill,
    spentAt,
    paymentPaidAt,
});

export default ExpenseResponseWithSpecificPaymentResponse;
