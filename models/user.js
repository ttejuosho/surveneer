module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      isEmail: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    surveyImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  User.associate = (models) => {
    User.hasMany(models.Survey, {
      onDelete: 'cascade',
    });
    User.hasMany(models.Respondent, {
      onDelete: 'cascade',
    });
  };

  return User;
};
