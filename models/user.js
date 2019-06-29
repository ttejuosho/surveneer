module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        emailAddress: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phoneNumber: {
            type: DataTypes.TEXT,
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