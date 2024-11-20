import { DataTypes } from "sequelize";
import specModel from "./specmodels";

const itemModel = (sequelize: any) => {
  const Item = sequelize.define(
    "item",
    {
      spec_id: {
        type: DataTypes.INTEGER,
        references: {
          model: specModel(sequelize),
          key: "id",
        },
        allowNull: false,
        onDelete: "CASCADE",
      },
      component_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      component_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      component_desc_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      component_desc_c_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      component_desc_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      item_c_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      item_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      item_long_desc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size1_value:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      size1_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size1_c_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size1_inch: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size1_mm: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size2_value:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      size2_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size2_c_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size2_inch: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size2_mm: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      schedule1_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      schedule1_c_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      schedule1_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      schedule2_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      schedule2_c_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      schedule2_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rating_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rating_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rating_c_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      material_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      material_c_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      material_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dimensional_standards: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      short_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      g_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      s_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  // Associations
  Item.associate = (models: any) => {
    Item.belongsTo(models.Spec, {
      foreignKey: "specId",
      as: "spec",
    });
  };

  return Item;
};

export default itemModel;