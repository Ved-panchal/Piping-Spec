import express,{Express} from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';
import authRoute from "./routes/authRoutes"
import userRoute from "./routes/userRoutes"
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from "./docs/swaggeroption";

dotenv.config();

const app:Express = express();

// Swagger setup
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoute);
app.use('/users', userRoute);



export default app;
