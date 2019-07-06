module.exports = (sequelize, DataTypes) => { 
    const Response = sequelize.define("Response", {
        question: {
            type: DataTypes.STRING,
            allowNull: false
        },
        answer: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    Response.associate = (models) => {
        Response.belongsTo(models.Survey, {
            foreignKey: {
                allowNull: false,
                onDelete: 'cascade'
            }
        });
    }
    return Response;
}