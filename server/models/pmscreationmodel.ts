import { DataTypes } from "sequelize";
import specModel from "./specmodels";

const pmsCreationModel = (sequelize: any) => {
  const PMSCreation = sequelize.define(
    "pms_creation",
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
      component_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      component_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      component_desc_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      component_desc_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      component_desc_client_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      component_desc_g_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      component_desc_s_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size1_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size1_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size1_client_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size2_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size2_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size2_client_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      schedule_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      schedule_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      schedule_client_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rating_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rating_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rating_client_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      material_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      material_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      material_client_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dimensional_standard_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dimensional_standard_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        default: 0,
      }
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  // Associations
  PMSCreation.associate = (models: any) => {
    PMSCreation.belongsTo(models.Spec, {
      foreignKey: "specId",
      as: "spec",
    });
  };

  return PMSCreation;
};

export default pmsCreationModel;