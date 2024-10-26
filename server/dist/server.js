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
// server.ts
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const dotenv_1 = __importDefault(require("dotenv"));
const models_1 = require("./models");
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, database_1.database)();
    yield (0, models_1.syncDatabase)();
    app_1.default.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
startServer().catch(error => {
    console.error("Failed to start the server:", error);
});
