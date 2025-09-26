import { DataTypes } from "sequelize";

const sessionModel = (sequelize: any) => {
    const Session = sequelize.define('session', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        token: {
            type: DataTypes.STRING(500),
            allowNull: false,
            unique: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        deviceInfo: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        ipAddress: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['token']
            },
            {
                fields: ['isActive']
            }
        ]
    });

    return Session;
}

export default sessionModel;
