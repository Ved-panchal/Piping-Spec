"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncDatabase = void 0;
// models/index.ts
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const usermodel_1 = __importDefault(require("./usermodel"));
const projectmodel_1 = __importDefault(require("./projectmodel"));
const subscriptionmodel_1 = __importDefault(require("./subscriptionmodel"));
const planmodels_1 = __importDefault(require("./planmodels"));
const specmodels_1 = __importDefault(require("./specmodels"));
const componentmodels_1 = __importDefault(require("./componentmodels"));
const componentdescmodels_1 = __importDefault(require("./componentdescmodels"));
const defaultcomponentdesc_1 = __importDefault(require("./Default/defaultcomponentdesc"));
const ratingmodel_1 = __importDefault(require("./ratingmodel"));
const defaultratingmodel_1 = __importDefault(require("./Default/defaultratingmodel"));
const schedulemodels_1 = __importDefault(require("./schedulemodels"));
const defaultscheulemodel_1 = __importDefault(require("./Default/defaultscheulemodel"));
const sizemodels_1 = __importDefault(require("./sizemodels"));
const defaultsizemodel_1 = __importDefault(require("./Default/defaultsizemodel"));
dotenv_1.default.config();
const sequelize = new sequelize_1.Sequelize(process.env.DB_URL, {
    logging: true,
    dialect: 'postgres',
});
// Define models
const User = (0, usermodel_1.default)(sequelize);
const Project = (0, projectmodel_1.default)(sequelize);
const Subscription = (0, subscriptionmodel_1.default)(sequelize);
const Plan = (0, planmodels_1.default)(sequelize);
const Spec = (0, specmodels_1.default)(sequelize);
const Component = (0, componentmodels_1.default)(sequelize);
const ComponentDesc = (0, componentdescmodels_1.default)(sequelize);
const D_Component = (0, defaultcomponentdesc_1.default)(sequelize);
const Rating = (0, ratingmodel_1.default)(sequelize);
const D_Rating = (0, defaultratingmodel_1.default)(sequelize);
const Schedule = (0, schedulemodels_1.default)(sequelize);
const D_Schedule = (0, defaultscheulemodel_1.default)(sequelize);
const Size = (0, sizemodels_1.default)(sequelize);
const D_Size = (0, defaultsizemodel_1.default)(sequelize);
D_Component.associate({ Component });
Project.associate({ User, Spec });
Spec.associate({ Project });
const db = {
    sequelize,
    User,
    Spec,
    Project,
    Subscription,
    Plan,
    Component,
    ComponentDesc,
    D_Component,
    Rating,
    D_Rating,
    Schedule,
    D_Schedule,
    Size,
    D_Size,
};
const syncDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield sequelize.sync();
        console.log('Database & tables created!');
    }
    catch (error) {
        console.error('Error creating tables:', error);
    }
});
exports.syncDatabase = syncDatabase;
exports.default = db;
