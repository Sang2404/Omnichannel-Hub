import express, { Express } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorMiddleware } from './shared/middlewares/error.middleware';
import { setupSwagger } from './config/swagger';

const app: Express = express();

// Standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API Documentation (available at /api-docs)
setupSwagger(app);

// Register all API routes under /api
app.use('/api', routes);

// Global Error Handler
app.use(errorMiddleware);

export default app;

