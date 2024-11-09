import { DataTypes } from "sequelize";

const DimensionalStandardModel= (sequelize:any) => {
    const DimensionalStandard = sequelize.define(
        "dimensional_standard",
        {
            component_id: {
                type: DataTypes.INTEGER,
                    references: {
                        model: "components",
                        key: "id",
                    },
                    onDelete: "CASCADE",
            },
            dimensional_standard:{
                type:DataTypes.STRING,
                allowNull:false,
            }
        },
        {
            timestamps: true,
            underscored: true,
        }
    )

    DimensionalStandard.associate = (models: any) => {
        DimensionalStandard.belongsTo(models.Component,{
            foreignkey:"component_id",
            as:"component",
        });
    };
    return DimensionalStandard;
}

export default DimensionalStandardModel;