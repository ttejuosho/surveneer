module.exports = (sequelize, DataTypes) => {
    const Survey = sequelize.define("Survey", {
        surveyName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        getId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        surveyNotes: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    Survey.associate = (models) => {
        Survey.hasMany(models.Question, {
            onDelete: 'cascade'
        });
        Survey.hasMany(models.Response, {
            onDelete: 'cascade'
        });
    };

    return Survey;
}