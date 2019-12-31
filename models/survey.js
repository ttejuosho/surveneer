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
    surveyBrandname: {
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
      allowNull: false,
    },
    notify: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    affirmation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    affirmationStatement: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    acceptingResponses: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    preSurveyInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    postSurveyInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    surveyNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    surveyTOU: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    respondentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    recipientCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    questionCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    declinedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
  });

  Survey.associate = (models) => {
    Survey.belongsTo(models.User, {
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
