import express,{Express} from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import authRoute from "./routes/authRoutes"
import userRoute from "./routes/userRoutes";
import otpRoutes from "./routes/otpRoutes";
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
import itemOutputRoutes from "./routes/itemOutputRoutes";
import pmsCreationRoutes from "./routes/pmsCreationRoutes";
import catrefRoutes from "./routes/catrefRoutes";
import valvSubTypeRoutes from "./routes/valvSubTypeRoutes";
import constructionDescRoutes from "./routes/constructionDescRoutes";
import generateReviewOutputRoutes from "./routes/generateReviewOutputRoutes";
import reviewOutputRoutes from "./routes/reviewOutputRoutes";
import adminAuthRoutes from "./routes/adminAuthRoutes";
import adminUserRoutes from "./routes/adminUserRoutes";
import adminSubscriptionRoutes from "./routes/adminSubscriptionRoutes";
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
app.use('/otp',otpRoutes);
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
app.use('/items',itemOutputRoutes)
app.use('/catref',catrefRoutes);
app.use('/valvsubtype',valvSubTypeRoutes)
app.use('/constructiondesc',constructionDescRoutes)
// app.use('/dim-std',dimensionalStandardRoute)
app.use('/pmsc',pmsCreationRoutes)
app.use('/output',generateReviewOutputRoutes);
app.use('/unit-weight',reviewOutputRoutes)
app.use('/admin/auth', adminAuthRoutes);
app.use('/admin/users', adminUserRoutes);
app.use('/admin/subscriptions', adminSubscriptionRoutes);

export default app;
