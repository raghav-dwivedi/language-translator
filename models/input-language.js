// Schema of the input language codes stored in the database.

const Sequelize = require('sequelize');

const sequelize = require('../util/database').sequelize;

const InputLanguage = sequelize.define('InputLanguage', {
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
	name: {
		type: Sequelize.STRING,
		allowNull: false,
	},
});

module.exports = InputLanguage;
