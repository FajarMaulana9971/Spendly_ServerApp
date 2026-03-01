import express from 'express'
import cors from 'cors'
import expenseRouter from './routes/expenseRoute.js'
import paymentRouter from './routes/paymentRoute.js'
import errorHandler from './middlewares/errorHandlerMiddleware.js'

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', expenseRouter);
app.use('/api', paymentRouter);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use(errorHandler);

export default app;