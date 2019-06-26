module.exports = (sequelize, DataTypes) => {
    const Questions = sequelize.define("Questions", {
        question: {             
            type: DataTypes.STRING,
            allowNull: false
        },
        options: {
            type: DataTypes.ARRAY,
            allowNull: false
        },
        optionsInput: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    return Questions;
}