const Sequelize = require('sequelize');

const sequelize = require('../util/database').sequelize;

const OutputLanguage = sequelize.define('outputLanguage', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	code: {
		type: Sequelize.STRING,
		allowNull: false,
	},
});

module.exports = OutputLanguage;
