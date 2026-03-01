const MonthlyReportResponse = ({
  year,
  month,
  totalAmount,
  paidAmount,
  unpaidAmount,
  totalCount,
  paidCount,
  unpaidCount,
}) => ({
  year,
  month,
  totalAmount,
  paidAmount,
  unpaidAmount,
  totalCount,
  paidCount,
  unpaidCount,
  paidPercentage:
    totalAmount > 0
      ? parseFloat(((paidAmount / totalAmount) * 100).toFixed(2))
      : 0,
  unpaidPercentage:
    totalAmount > 0
      ? parseFloat(((unpaidAmount / totalAmount) * 100).toFixed(2))
      : 0,
});

export default MonthlyReportResponse;
