// specmodel.ts
import { DataTypes } from "sequelize";

const specModel = (sequelize: any) => {
  const Spec = sequelize.define(
    "spec",
    {
      specName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          is: /^[A-Z0-9]+$/,
        },
      },
      rating: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          is: /^\d+#$/,
        },
      },
      baseMaterial: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      projectId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'projects', // Use the model name string
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
  Spec.associate = (models: any) => {
    Spec.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project",
    });
  };

  return Spec;
};

export default specModel;
