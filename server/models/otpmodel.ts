// models/otpmodel.ts
import { DataTypes } from "sequelize";

const otpmodel = (sequelize: any) => {
    const OTP = sequelize.define('OTP', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        otp: {
            type: DataTypes.STRING(6),
            allowNull: false
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        isUsed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        purpose: {
            type: DataTypes.ENUM('password_reset', 'email_verification'),
            allowNull: false,
            defaultValue: 'password_reset'
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'otps'
    });

    return OTP;
}

export default otpmodel;