class ExpenseRequestDto {
    constructor({ amount, category, description, date }) {
        this.amount = amount;
        this.category = category;
        this.description = description;
        this.date = date;
    }
}

export default ExpenseRequestDto;
