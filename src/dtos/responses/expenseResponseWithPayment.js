import PaymentBySelectedExpenseResponse from "./paymentBySelectedExpenseResponse.js";

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
  payment,
  createdAt,
  updatedAt,
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
  payment: payment ? PaymentBySelectedExpenseResponse(payment) : null,
  createdAt,
  updatedAt,
});

export default ExpenseResponse;
