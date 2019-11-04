module.exports = (sequelize, DataTypes) => {
    const Recipient = sequelize.define("Recipient", {
        recipientId: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        recipientName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        recipientEmail: {
            type: DataTypes.STRING,
            allowNull: false
        },
        recipientPhone: {
            type: DataTypes.BIGINT,
            allowNull: true
        }
    });

    Recipient.associate = (models) =>{
        Recipient.belongsTo(models.User, {
            foreignKey: {
              allowNull: false,
              onDelete: 'cascade',
            },
          });
        Recipient.belongsTo(models.Survey, {
        foreignKey: {
            allowNull: false,
            onDelete: 'cascade',
        },
        });
    }
    return Recipient;
}