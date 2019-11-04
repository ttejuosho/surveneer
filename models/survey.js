module.exports = (sequelize, DataTypes) => {
  const Survey = sequelize.define('Survey', {
    surveyId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    surveyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    surveyImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    getId: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    showTOU: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    preSurveyInstructions: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postSurveyInstructions: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    surveyNotes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    surveyTOU: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    numberOfRespondents: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    numberOfRecipients: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    numberOfQuestions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
  });

  Survey.associate = (models) => {
    Survey.belongsTo(models.User,{
      onDelete: 'cascade',
    });
    Survey.hasMany(models.Question, {
      onDelete: 'cascade',
    });
    Survey.hasMany(models.Response, {
      onDelete: 'cascade',
    });
    Survey.hasMany(models.Respondent, {
      onDelete: 'cascade',
    });
    Survey.hasMany(models.Recipient, {
      onDelete: 'cascade',
    });
  };

  return Survey;
};
