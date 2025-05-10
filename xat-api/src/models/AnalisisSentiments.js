const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SentimentAnalysis = sequelize.define('SentimentAnalysis', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    result: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['positive', 'negative', 'neutral']] 
        }
    },
    score: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            min: -1, 
            max: 1   
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = SentimentAnalysis;