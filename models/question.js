module.exports = (sequelize, DataTypes) => {
    const Question = sequelize.define("Question", {
        question: {
            type: DataTypes.STRING,
            allowNull: false
        },
        options: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    Question.associate = (models) => {
        Question.belongsTo(models.Survey, {
            foreignKey: {
                allowNull: false,
                onDelete: 'cascade'
            }
        });
    }

    return Question;
}