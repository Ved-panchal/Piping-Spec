import express,{Express} from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import authRoute from "./routes/authRoutes"
import userRoute from "./routes/userRoutes"
import projectRoute from "./routes/projectRoutes";
import planRoute from "./routes/planRoutes";
import specRoute from "./routes/specRoutes";
import sizeRangeRoute from "./routes/sizeRangeRoutes";
import branchRoute from "./routes/branchRoutes";
import dimensionalStandardRoute from "./routes/dimensionalStandardRoutes";
import materialRoute from "./routes/materialRoutes";
import componentDescRoute from "./routes/componentDescRoutes";
import componentRoute from "./routes/componentRoutes"
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

app.use(cors({
    origin: ['https://piping-spec.vercel.app', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type','Authorization'] 
  }));
  
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoute);
app.use('/users', userRoute);
app.use('/projects',projectRoute);
app.use('/plans',planRoute);
app.use('/specs',specRoute);
app.use('/sizeranges',sizeRangeRoute);
app.use('/ratings',ratingRoute);
app.use('/schedules',scheduleRoute);
app.use('/sizes',sizeRoute);
app.use('/components',componentRoute);
app.use('/componentdescs',componentDescRoute);
app.use('/materials',materialRoute);
app.use('/dimensional-standards',dimensionalStandardRoute);
app.use('/branch_table',branchRoute);

export default app;
