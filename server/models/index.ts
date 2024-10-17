// models/index.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import userModel from './usermodel';
import projectModel from "./projectmodel";
import subscriptionmodel from "./subscriptionmodel";
import planModel from "./planmodels";

dotenv.config();

const sequelize = new Sequelize(process.env.DB_URL!, {
    logging: true,
    dialect: 'postgres', 
  });

const User = userModel(sequelize);
const Project = projectModel(sequelize);
const Subscription = subscriptionmodel(sequelize);
const Plan = planModel(sequelize);

const db = {
    sequelize,
    User,
    Project,
    Subscription,
    Plan,
};

const syncDatabase = async () => {
    try {
        await sequelize.sync();
        console.log('Database & tables created!');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
};

export { syncDatabase };
export default db;
