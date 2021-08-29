process.env.GOOGLE_APPLICATION_CREDENTIALS = './token.json';

const express = require('express');

const initialize = require('./util/database').initialize;

const translate = require('./routes/translate');

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

initialize()
	.then(() => {
		app.listen(8080);
	})
	.catch((err) => {
		console.log(err);
	});
