module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    questionId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    questionInstruction: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    optionType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    option1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    option2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    option3: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    option4: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    YesResponseCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    NoResponseCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    TrueResponseCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    FalseResponseCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });

  Question.associate = (models) => {
    Question.belongsTo(models.Survey, {
      foreignKey: {
        allowNull: false,
        onDelete: 'cascade',
      },
    });
    Question.hasMany(models.Response, {
      foreignKey: {
        allowNull: false,
        onDelete: 'cascade',
      },
    });
  };
  return Question;
};
