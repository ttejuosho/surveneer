module.exports = (sequelize, DataTypes) => {
    const Survey = sequelize.define("Survey", {
        surveyId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            foreignKey: true,
            autoIncrement: true,
        },
        surveyName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        getId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        preSurveyInstructions: {
            type: DataTypes.STRING,
            allowNull: true
        },
        postSurveyInstructions: {
            type: DataTypes.STRING,
            allowNull: true
        },
        surveyNotes: {
            type: DataTypes.STRING,
            allowNull: true
        },
        numberOfRespondents: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true
        },
        numberOfQuestions: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
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
        Survey.hasMany(models.Respondent, {
            onDelete: 'cascade'
        });
    };

    return Survey;
}