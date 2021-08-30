// Connecting to the database

const Sequelize = require('sequelize');
const mysql = require('mysql2/promise');

// Sequelize connection
const sequelize = new Sequelize(
	`${process.env.MYSQL_DATABASE}`,
	`${process.env.MYSQL_USERNAME}`,
	`${process.env.MYSQL_PASSWORD}`,
	{
		dialect: process.env.DIALECT,
		host: process.env.HOST,
		port: process.env.MYSQL_PORT,
		logging: false,
	}
);

// Creating database if it doesn't exist, syncing the tables with the data models
async function initialize() {
	try {
		const host = process.env.HOST;
		const port = process.env.MYSQL_PORT;
		const user = `${process.env.MYSQL_USERNAME}`;
		const password = `${process.env.MYSQL_PASSWORD}`;
		const database = `${process.env.MYSQL_DATABASE}`;

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
