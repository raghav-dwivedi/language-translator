require('dotenv').config();

const express = require('express');

const initialize = require('./util/database').initialize;

const translate = require('./routes/translate');

const InputLanguage = require('./models/input-language');
const OutputLanguage = require('./models/output-language');
const Data = require('./models/data');

const getLanguages = require('./middlewares/codes-generator');
const countryByLanguage = require('./middlewares/country-language-linker');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

app.use(getLanguages);
app.use(countryByLanguage);

app.use(translate);

app.use((error, req, res) => {
	console.log(error);
	const status = error.statusCode || 500;
	const message = error.message;
	res.status(status).json({
		message: message,
	});
});

Data.belongsTo(InputLanguage);
Data.belongsTo(OutputLanguage);

initialize()
	.then(() => {
		app.listen(process.env.PORT);
	})
	.catch((err) => {
		throw err;
	});
