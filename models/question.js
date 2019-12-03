module.exports = (sequelize, DataTypes) => {
    const Question = sequelize.define('Question', {
        questionId: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        question: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        required: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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
        option1ResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        option2ResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        option3ResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        option4ResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        YesResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        NoResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        TrueResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        FalseResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        Star5ResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        Star4ResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        Star3ResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        Star2ResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        Star1ResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        Number5ResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        Number4ResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        Number3ResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        Number2ResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        Number1ResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        StronglyDisagreeResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        DisagreeResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        UndecidedResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        AgreeResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        StronglyAgreeResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        GoodResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        VeryGoodResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        AcceptableResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        PoorResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        VeryPoorResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        VeryHighResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        HighResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        ModerateResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        LowResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        NoneResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        VeryFrequentlyResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        FrequentlyResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        OccasionallyResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        RarelyResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        NeverResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        VeryImportantResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        ImportantResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        ModeratelyImportantResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        SlightlyImportantResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        },
        NotImportantResponseCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: true,
        }
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