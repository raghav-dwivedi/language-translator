const { Translate } = require('@google-cloud/translate').v2;

const InputLanguage = require('../models/input-language');
const OutputLanguage = require('../models/output-language');

const translate = new Translate();

module.exports = async (req, res, next) => {
	const check = await InputLanguage.findByPk(1);
	if (!check) {
		try {
			const [languages] = await translate.getLanguages();
			const codes = [];
			languages.forEach((language) => {
				codes.push(language.code);
			});
			console.log('Adding language codes to input and output tables.');
			for (let i = 0; i < codes.length; i++) {
				await InputLanguage.create({
					code: codes[i],
				});
				await OutputLanguage.create({
					code: codes[i],
				});
			}
			next();
		} catch (error) {
			console.log(error);
			next();
		}
	} else {
		next();
	}
};
