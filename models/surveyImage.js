module.exports = (sequelize, DataTypes) => {
    const SurveyImage = sequelize.define("SurveyImage", {
        surveyImageName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        surveyImage: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    SurveyImage.associate = (models) => {
        SurveyImage.belongsTo(models.Survey, {
            foreignKey: {
                allowNull: false,
                onDelete: 'cascade'
            }
        });
    }
    return SurveyImage;
};