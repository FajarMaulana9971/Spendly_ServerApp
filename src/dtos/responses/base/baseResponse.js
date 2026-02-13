class BaseResponse {
    constructor(success, data = null, message = null) {
        this.success = success;
        this.data = data;
        if (message) {
            this.message = message;
        }
    }

    static success(data, message = 'Success') {
        return new BaseResponse(true, data, message);
    }

    static error(message = 'Error', data = null) {
        return new BaseResponse(false, data, message);
    }
}

module.exports = BaseResponse;