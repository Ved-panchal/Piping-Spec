// defaultComponentModel.ts
import { DataTypes } from "sequelize";
import projectModel from "./projectmodel";

const ComponentDescModel = (sequelize: any) => {
  const ComponentDesc = sequelize.define(
    "component_desc",
    {
    component_id: {
        type: DataTypes.INTEGER,
            references: {
                model: "components",
                key: "id",
            },
            onDelete: "CASCADE",
    },
      itemDescription: {
        type: DataTypes.STRING, 
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(10), 
        allowNull: false,
        validate: {
          is: /^[0-9A-Z]+$/,
        },
      },
      c_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          is: /^[0-9A-Z]+$/,
        },
      },
      ratingrequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },  
      g_type:{
        type:DataTypes.STRING,
        allownull:true,
      },
      s_type:{
        type:DataTypes.STRING,
        allownull:true,
      },
      short_code:{
        type:DataTypes.STRING,
        allownull:true,
      },
      project_id: {
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
    }
  );

  ComponentDesc.associate = (models: any) => {
    ComponentDesc.belongsTo(models.Component, {
      foreignKey: "component_id",
      as: "components",
    });
    ComponentDesc.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "projects",
    });
  };

  return ComponentDesc;
};

export default ComponentDescModel;
