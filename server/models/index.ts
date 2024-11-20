// models/index.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import userModel from './usermodel';
import projectModel from "./projectmodel";
import subscriptionModel from "./subscriptionmodel";
import planModel from "./planmodels";
import specModel from "./specmodels";
import sizeRangeModel from "./sizerangemodels";
import branchModel from "./branchmodel";
import MaterialModel from "./materialmodel";
import defaultMaterialModel from "./Default/defaultmaterial";
import componentModel from "./componentmodels";
import componentDescModel from "./componentdescmodels";
import defaultComponentModel from "./Default/defaultcomponentdesc";
import ratingModel from "./ratingmodel";
import defaultRatingModel from "./Default/defaultratingmodel";
import scheduleModel from "./schedulemodels";
import defaultScheduleModel from "./Default/defaultscheulemodel";
import sizeModel from "./sizemodels";
import defaultSizeModel from "./Default/defaultsizemodel";
import DimensionalStandardModel from "./dimensionalmodel";
import itemModel from "./itemoutputmodel";

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
const Branch = branchModel(sequelize);
const DimensionalStandard = DimensionalStandardModel(sequelize);
const Material = MaterialModel(sequelize)
const D_Material = defaultMaterialModel(sequelize);
const Component = componentModel(sequelize);
const ComponentDesc = componentDescModel(sequelize);
const D_Component = defaultComponentModel(sequelize);
const Rating = ratingModel(sequelize);
const D_Rating = defaultRatingModel(sequelize);
const Schedule = scheduleModel(sequelize);
const D_Schedule = defaultScheduleModel(sequelize);
const Size = sizeModel(sequelize);
const D_Size = defaultSizeModel(sequelize);
const Item = itemModel(sequelize);

D_Component.associate({Component});
Project.associate({ User, Spec });
Spec.associate({ Project });
SizeRange.associate({ Size, Schedule, Spec });
DimensionalStandard.associate({Component});

const db = {
    sequelize,
    User,
    Spec,
    Project,
    Subscription,
    Plan,
    SizeRange,
    Branch,
    DimensionalStandard,
    Material,
    D_Material,
    Component,
    ComponentDesc,
    D_Component,
    Rating,
    D_Rating,
    Schedule,
    D_Schedule,
    Size,
    D_Size,
    Item
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
