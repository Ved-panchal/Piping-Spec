import express,{Express} from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import authRoute from "./routes/authRoutes"
import userRoute from "./routes/userRoutes"
import projectRoute from "./routes/projectRoutes"
import planRoute from "./routes/planRoutes";
import specRoute from "./routes/specRoutes";
import ratingRoute from "./routes/ratingRoutes"
import scheduleRoute from "./routes/scheduleRoutes"
import sizeRoute from "./routes/sizeRoutes";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from "./docs/swaggeroption";

dotenv.config();

const app:Express = express();

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cors(
    {origin: '*',
    credentials: true
    } ));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoute);
app.use('/users', userRoute);
app.use('/projects',projectRoute);
app.use('/plans',planRoute);
app.use('/specs',specRoute);
app.use('/ratings',ratingRoute);
app.use('/schedules',scheduleRoute);
app.use('/sizes',sizeRoute);

export default app;
