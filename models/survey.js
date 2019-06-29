module.exports = (sequelize, DataTypes) => {
    const Survey = sequelize.define("Survey", {
        surveyName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        getId: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        surveyNotes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    });

    Survey.associate = (models) => {
        Survey.hasMany(models.Question, {
            onDelete: 'cascade'
        });
    };

    return Survey;
}