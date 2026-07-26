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
      // Stable join key to component_descs.code / default_components.code.
      // item_short_desc is only a display copy of that row's text at the time
      // this catref was created; it can drift out of sync if the description
      // is later renamed, so matching must prefer this code when present.
      component_desc_code: {
        type: DataTypes.STRING,
        allowNull: true,
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