// server.ts
import app from "./app";
import { database } from "./config/database";
import dotenv from 'dotenv';
import {syncDatabase} from "./models";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await database();
  await syncDatabase(); 
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(error => {
  console.error("Failed to start the server:", error);
});
