module.exports = (sequelize, DataTypes) => {
  const Response = sequelize.define('Response', {
    responseId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    answer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Response.associate = (models) => {
    Response.belongsTo(models.Survey, {
      foreignKey: {
        allowNull: false,
        onDelete: 'cascade',
      },
    });
    Response.belongsTo(models.Respondent, {
      foreignKey: {
        allowNull: false,
        onDelete: 'cascade',
      },
    });
    Response.belongsTo(models.Question, {
      foreignKey: {
        allowNull: false,
        onDelete: 'cascade',
      },
    });
  };
  return Response;
};
