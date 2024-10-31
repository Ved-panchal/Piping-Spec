// models/index.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import userModel from './usermodel';
import projectModel from "./projectmodel";
import subscriptionModel from "./subscriptionmodel";
import planModel from "./planmodels";
import specModel from "./specmodels";
import sizeRangeModel from "./sizerangemodels";
import componentModel from "./componentmodels";
import componentDescModel from "./componentdescmodels";
import defaultComponentModel from "./Default/defaultcomponentdesc";
import ratingModel from "./ratingmodel";
import defaultRatingModel from "./Default/defaultratingmodel";
import scheduleModel from "./schedulemodels";
import defaultScheduleModel from "./Default/defaultscheulemodel";
import sizeModel from "./sizemodels";
import defaultSizeModel from "./Default/defaultsizemodel";

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
const SizeRange = sizeRangeModel(sequelize);
const Component = componentModel(sequelize);
const ComponentDesc = componentDescModel(sequelize);
const D_Component = defaultComponentModel(sequelize);
const Rating = ratingModel(sequelize);
const D_Rating = defaultRatingModel(sequelize);
const Schedule = scheduleModel(sequelize);
const D_Schedule = defaultScheduleModel(sequelize);
const Size = sizeModel(sequelize);
const D_Size = defaultSizeModel(sequelize);

D_Component.associate({Component});
Project.associate({ User, Spec });
Spec.associate({ Project });
SizeRange.associate({ Size, Schedule, Spec });

const db = {
    sequelize,
    User,
    Spec,
    Project,
    Subscription,
    Plan,
    SizeRange,
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
