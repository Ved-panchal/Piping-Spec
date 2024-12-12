import { DataTypes } from "sequelize";

const DefaultCatRefModel = (sequelize:any) => {
  const DefaultCatRef = sequelize.define(
    "default_catref",
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
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  return DefaultCatRef;
};

export default DefaultCatRefModel;