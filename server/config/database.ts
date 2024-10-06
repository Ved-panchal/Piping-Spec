import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.DB_URL!, {
    logging: true,
    dialect: 'postgres', 
  });

const database = async() => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
        return sequelize;
      } catch (error) {
        console.error("Unable to connect to the database:", error);
      }
}

export {sequelize, database};