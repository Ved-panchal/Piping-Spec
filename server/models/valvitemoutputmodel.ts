import { DataTypes } from "sequelize";
import specModel from "./specmodels";

const valvSubTypePMSCreationModel = (sequelize: any) => {
  const ValvSubTypePMSCreation = sequelize.define(
    "valv_sub_type_pms_creation",
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
      component_desc_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size1_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size2_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      schedule_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rating_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      material_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dimensional_standard_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      valv_sub_type_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      construction_desc_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
    }
  );

  ValvSubTypePMSCreation.associate = (models: any) => {
    ValvSubTypePMSCreation.belongsTo(models.Spec, {
      foreignKey: "specId",
      as: "spec",
    });
  };

  return ValvSubTypePMSCreation;
};

export default valvSubTypePMSCreationModel;