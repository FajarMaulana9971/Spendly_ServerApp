import ExpenseRequest from "../../../dtos/requests/expenseRequest.js";

class RequestExpenseMapper {
    static fromBody(body) {
        return ExpenseRequest({
            title: body.title,
            amount: body.amount,
            category: body.category,
            note: body.note,
            spentAt: body.spentAt
        });
    }

    static toEntity(expenseRequest) {
        const entity = {};

        if (expenseRequest.title !== undefined) entity.title = expenseRequest.title;
        if (expenseRequest.amount !== undefined) entity.amount = expenseRequest.amount;
        if (expenseRequest.category !== undefined) entity.category = expenseRequest.category;
        if (expenseRequest.isSplitBill !== undefined) entity.isSplitBill = expenseRequest.isSplitBill;
        if (expenseRequest.note !== undefined) entity.note = expenseRequest.note;
        if (expenseRequest.spentAt !== undefined) entity.spentAt = expenseRequest.spentAt;

        return entity;
    }

    static bodyToEntity(body) {
        const expenseRequest = this.fromBody(body);
        return this.toEntity(expenseRequest);
    }
}

export default RequestExpenseMapper;