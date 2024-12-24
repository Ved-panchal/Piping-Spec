import { DataTypes } from "sequelize";

const reducer = (sequelize: any) => {
    const Reducer = sequelize.define(
        "reducer",
        {
            type: {
                type: DataTypes.STRING, 
                allowNull: true,
            },
            big_size: {
                type: DataTypes.INTEGER, 
                allowNull: true,
            },
            small_size: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        }
    )
    return Reducer;
}

export default reducer;