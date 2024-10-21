import { DataTypes } from "sequelize";
import projectModel from "./projectmodel";

const scheduleModel = (sequelize: any) => {
  const Schedule = sequelize.define(
    "schedule",
    {
      sch1_sch2: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          is: /^[0-9A-Z]+$/,
        },
      },
      code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          is: /^[0-9A-Z]+$/,
        },
      },
      schDesc: {
        type: DataTypes.STRING,  
        allowNull: false,
      },
      projectId: {
        type: DataTypes.INTEGER, 
        references: {
          model: projectModel(sequelize),
          key: 'id',
        },
        allowNull: false,
        onDelete: "CASCADE",
      },
    },
    {
      timestamps: true,  
      underscored: true, 
      paranoid: true,  
      deletedAt: 'deleted_at',  
    }
  );

  // Associations
  Schedule.associate = (models: any) => {
    Schedule.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project",
    });
  };

  return Schedule;
};

export default scheduleModel;
