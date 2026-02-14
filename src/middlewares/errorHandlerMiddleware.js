import BaseResponse from '../dtos/responses/base/baseResponse.js'

function errorHandler (err, req, res, next) {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json(BaseResponse.error(message));
}

export default errorHandler;