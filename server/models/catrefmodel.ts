import { DataTypes } from "sequelize";
import projectModel from "./projectmodel";

const CatRefModel = (sequelize:any) => {
  const CatRef = sequelize.define(
    "catref",
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

  return CatRef;
};

export default CatRefModel;