import { DataTypes } from "sequelize";

const subscriptionmodel = (sequelize:any) => {
    const subs = sequelize.define('subscription',{
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        planId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'plans',
                key: 'planId',
            },
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        NoofProjects:{
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        NoofSpecs:{
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'cancelled'),
            allowNull: false,
        },
    })
    return subs;
}

export default subscriptionmodel;