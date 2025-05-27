import { DataTypes } from "sequelize";
import projectModel from "./projectmodel";

const ValvCatRefModel = (sequelize:any) => {
  const ValvCatRef = sequelize.define(
    "valv_catref",
    {
      component_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      item_short_desc: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rating: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      valv_sub_type:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      construction_desc:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      concatenate: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      catalog: {
        type: DataTypes.STRING,
        allowNull: true,
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

  return ValvCatRef;
};

export default ValvCatRefModel;