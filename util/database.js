const Sequelize = require('sequelize');
const mysql = require('mysql2/promise');

const sequelize = new Sequelize(
	`${process.env.MYSQL_DATABASE}`,
	`${process.env.MYSQL_USERNAME}`,
	`${process.env.MYSQL_PASSWORD}`,
	{
		dialect: 'mysql',
		host: 'localhost',
		port: process.env.MYSQL_PORT,
		logging: false,
	}
);

async function initialize() {
	try {
		const host = 'localhost';
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
		console.log(error);
	}
}

exports.sequelize = sequelize;
exports.initialize = initialize;
