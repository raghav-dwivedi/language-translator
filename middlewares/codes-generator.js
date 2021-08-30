// This middleware populates the input and output language codes in the inputLanguages and outputLanguages tables

const { Translate } = require('@google-cloud/translate').v2;

const InputLanguage = require('../models/input-language');
const OutputLanguage = require('../models/output-language');

const translate = new Translate();

module.exports = async (req, res, next) => {
	try {
		// Checking to see if data already exists in inputLanguages and outputLanguages tables
		const check = await InputLanguage.findByPk(1);

		if (!check) {
			// If check fails, list of languages is requested from the google translate service
			const [languages] = await translate.getLanguages();

			// Populating inputLanguages and outputLanguages tables
			console.log(
				'Adding language codes to inputLanguages and outputLanguages tables.'
			);
			for (let i = 0; i < languages.length; i++) {
				await InputLanguage.create({
					code: languages[i].code,
					name: languages[i].name,
				});
				await OutputLanguage.create({
					code: languages[i].code,
					name: languages[i].name,
				});
			}
			next();
		} else {
			next();
		}
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};
