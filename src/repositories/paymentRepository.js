class PaymentRepository {

    async create(tx, data) {
        return tx.payment.create({ data })
    }
}

export default new PaymentRepository()
