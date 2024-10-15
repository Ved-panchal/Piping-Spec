import { DataTypes } from "sequelize";

const subscriptionmodel = (sequelize:any) => {
    const subs = sequelize.define('Subscription',{
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
        },
        planId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Plans',
                key: 'id',
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
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'cancelled'),
            allowNull: false,
        },
    })
}