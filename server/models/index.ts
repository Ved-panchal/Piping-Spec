// models/index.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import userModel from './usermodel';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_URL!, {
    logging: true,
    dialect: 'postgres', 
  });

const User = userModel(sequelize);

const db = {
    sequelize,
    User,
};

// Synchronize models with the database
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
