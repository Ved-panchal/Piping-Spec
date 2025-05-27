import { DataTypes } from "sequelize";

const DefaultValvCatRefModel = (sequelize:any) => {
  const DefaultValvCatRef = sequelize.define(
    "default_valv_catref",
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
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  return DefaultValvCatRef;
};

export default DefaultValvCatRefModel;