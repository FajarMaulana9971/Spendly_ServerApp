import { ExpenseResponse } from "./expenseResponse.js";

export const PaymentBySelectedExpenseResponse = ({
                                                     id,
                                                     totalAmount,
                                                     paidAt,
                                                     note,
                                                     expenses,
                                                     createdAt,
                                                     updatedAt
                                                 }) => ({
    id,
    totalAmount,
    paidAt,
    note,
    expenses: expenses?.map(exp => ExpenseResponse(exp)) ?? [],
    createdAt,
    updatedAt
});

export default PaymentBySelectedExpenseResponse;
