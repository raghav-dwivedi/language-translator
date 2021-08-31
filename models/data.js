// Schema of the translation data stored in database

const Sequelize = require('sequelize');

const sequelize = require('../util/database').sequelize;

const Data = sequelize.define(
	'data',
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		originalString: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		translatedString: {
			type: Sequelize.STRING,
			allowNull: false,
		},
	},
	{ charset: 'utf8' }
);

module.exports = Data;
