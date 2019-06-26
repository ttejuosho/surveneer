module.exports = (sequelize, DataTypes) => {
    const Lodge = sequelize.define("Lodge", {
        lodgeNumber: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        lodgeName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        logdeAddress: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });
    return Lodge;
}