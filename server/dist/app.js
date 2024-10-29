"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const planRoutes_1 = __importDefault(require("./routes/planRoutes"));
const specRoutes_1 = __importDefault(require("./routes/specRoutes"));
const componentDescRoutes_1 = __importDefault(require("./routes/componentDescRoutes"));
const componentRoutes_1 = __importDefault(require("./routes/componentRoutes"));
const ratingRoutes_1 = __importDefault(require("./routes/ratingRoutes"));
const scheduleRoutes_1 = __importDefault(require("./routes/scheduleRoutes"));
const sizeRoutes_1 = __importDefault(require("./routes/sizeRoutes"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggeroption_1 = __importDefault(require("./docs/swaggeroption"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggeroption_1.default);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
app.use((0, cors_1.default)({
    origin: ['https://piping-spec.vercel.app', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/auth', authRoutes_1.default);
app.use('/users', userRoutes_1.default);
app.use('/projects', projectRoutes_1.default);
app.use('/plans', planRoutes_1.default);
app.use('/specs', specRoutes_1.default);
app.use('/ratings', ratingRoutes_1.default);
app.use('/schedules', scheduleRoutes_1.default);
app.use('/sizes', sizeRoutes_1.default);
app.use('/components', componentRoutes_1.default);
app.use('/componentdescs', componentDescRoutes_1.default);
exports.default = app;
