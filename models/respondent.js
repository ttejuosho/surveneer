module.exports = (sequelize, DataTypes) => { 
    const Respondent = sequelize.define("Respondent", {
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

    Respondent.associate = (models) => {
        Respondent.belongsTo(models.Response, {
            foreignKey: {
                allowNull: false,
                onDelete: 'cascade'
            }
        });
    }
    return Respondent;
}