// Connecting to the database

const Sequelize = require('sequelize');
const mysql = require('mysql2/promise');

// Sequelize connection
const sequelize = new Sequelize(
	`${process.env.SQL_DATABASE}`,
	`${process.env.SQL_USERNAME}`,
	`${process.env.SQL_PASSWORD}`,
	{
		dialect: process.env.DIALECT,
		host: process.env.HOST,
		port: process.env.SQL_PORT,
		logging: false,
	}
);

// Creating database if it doesn't exist, syncing the tables with the data models
async function initialize() {
	try {
		const host = process.env.HOST;
		const port = process.env.SQL_PORT;
		const user = `${process.env.SQL_USERNAME}`;
		const password = `${process.env.SQL_PASSWORD}`;
		const database = `${process.env.SQL_DATABASE}`;

		const connection = await mysql.createConnection({
			host,
			port,
			user,
			password,
		});
		await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
		return await sequelize.sync();
	} catch (error) {
		next(error);
	}
}

exports.sequelize = sequelize;
exports.initialize = initialize;
