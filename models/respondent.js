module.exports = (sequelize, DataTypes) => {
    const Respondent = sequelize.define("Respondent", {
        respondentId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        respondentName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        respondentEmail: {
            type: DataTypes.STRING,
            allowNull: true
        },
        respondentPhone: {
            type: DataTypes.BIGINT,
            allowNull: true
        }
    });

    return Respondent;
}