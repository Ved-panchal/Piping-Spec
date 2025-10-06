import { DataTypes } from "sequelize";

const sessionModel = (sequelize: any) => {
    const Session = sequelize.define('session', {
        user_id: {
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
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        device_info: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        ip_address: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['token']
            },
            {
                fields: ['is_active']
            }
        ]
    });

    return Session;
}

export default sessionModel;
