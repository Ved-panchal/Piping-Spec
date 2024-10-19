// models/index.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import userModel from './usermodel';
import projectModel from "./projectmodel";
import subscriptionModel from "./subscriptionmodel";
import planModel from "./planmodels";
import specModel from "./specmodels";
import ratingModel from "./ratingmodel";
import defaultRatingModel from "./Default/defaultratingmodel";

dotenv.config();

const sequelize = new Sequelize(process.env.DB_URL!, {
    logging: true,
    dialect: 'postgres', 
});

// Define models
const User = userModel(sequelize);
const Project = projectModel(sequelize);
const Subscription = subscriptionModel(sequelize);
const Plan = planModel(sequelize);
const Spec = specModel(sequelize);
const Rating = ratingModel(sequelize);
const D_Rating = defaultRatingModel(sequelize);

// Define associations
Project.associate({ User, Spec });
Spec.associate({ Project });


const db = {
    sequelize,
    User,
    Spec,
    Project,
    Subscription,
    Plan,
    Rating,
    D_Rating,
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
