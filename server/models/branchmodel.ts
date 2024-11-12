import { DataTypes } from "sequelize";
import specModel from "./specmodels";

const branchModel = (sequelize: any) => {
    const Branch = sequelize.define(
        'branch_table',
        {
            branch_size: {
                type: DataTypes.FLOAT,  // Allows both integer and float values
                allowNull: false,
            },
            run_size: {
                type: DataTypes.FLOAT,  // Allows both integer and float values
                allowNull: false,
            },
            comp_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            specId: {
                type: DataTypes.INTEGER,
                references: {
                  model: specModel(sequelize),
                  key: "id",
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

    Branch.associate = (models: any) => {
        Branch.belongsTo(models.Spec, {
            foreignKey: "specId",
            as: "specs",
        });
    };

    return Branch;
}

export default branchModel;
