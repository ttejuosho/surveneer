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
            type: DataTypes.INTEGER,
            allowNull: true
        }
    });

    // Respondent.associate = (models) => {
    //     Respondent.belongsTo(models.Response, {
    //         foreignKey: {
    //             allowNull: false,
    //             onDelete: 'cascade'
    //         }
    //     });
    // }
    return Respondent;
}