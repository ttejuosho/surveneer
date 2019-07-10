module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        emailAddress: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phoneNumber: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    });

    User.associate = (models) => {
        User.hasMany(models.Survey, {
            onDelete: 'cascade'
        });
    };

    return User;
}