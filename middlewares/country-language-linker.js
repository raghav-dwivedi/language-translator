// This middleware generates helper data using the data provided in language-data.json

const fs = require('fs');

const countriesByLanguage = require('../data/language-data.json');
const languagesByCountry = './data/language-links.json';

module.exports = (req, res, next) => {
	try {
		// Check to see if the helper data already exists.

		if (fs.existsSync(languagesByCountry)) {
			next();
		} else {
			const languagesData = [];
			const countryLanguage = [];

			// Storing all the languages in languagesData array
			for (var key in countriesByLanguage) {
				languagesData.push(key);
			}
			if (languagesData.length == 0) {
				var error = new Error();
				error.message =
					'No languages found in language-data.json, please check for errors.';
				error.statusCode = 500;
				throw error;
			}

			// Looping through the languages of language-data
			languagesData.forEach((language) => {
				// Looping through the countries of each language
				for (let i = 0; i < countriesByLanguage[language].length; i++) {
					let check = true;

					// If the country already exists in the countryLanguage array,
					// pushing the language in languages array of the object
					countryLanguage.forEach((data) => {
						if (data.country === countriesByLanguage[language][i]) {
							data.languages.push(language);
							check = false;
						}
					});

					// Check to determine if the country exists in the countryLanguage array
					if (check) {
						// Creating a new object for a new country
						countryLanguage.push({
							country: countriesByLanguage[language][i],
							languages: [language],
						});
					}
				}
			});

			// Storing linked languages as an array of arrays
			const languageLinks = [];
			countryLanguage.forEach((object) => {
				languageLinks.push(object.languages);
			});
			let uniqueLanguageLinks = Array.from(
				new Set(languageLinks.map(JSON.stringify)),
				JSON.parse
			);
			fs.writeFileSync(
				'data/language-links.json',
				JSON.stringify(uniqueLanguageLinks)
			);

			// Finding and storing the languages which are the only major language of a country
			let soleLanguageOfCountry = [];
			uniqueLanguageLinks.forEach((languageArray) => {
				if (languageArray.length == 1) {
					soleLanguageOfCountry.push(languageArray[0]);
				}
			});
			fs.writeFileSync(
				'data/sole-languages.json',
				JSON.stringify(soleLanguageOfCountry)
			);

			// Storing a list of languages in language-data
			let languages = new Set();
			uniqueLanguageLinks.forEach((languageArray) => {
				languageArray.forEach((language) => {
					languages.add(language);
				});
			});
			languages = [...languages];
			fs.writeFileSync('data/languages-list.json', JSON.stringify(languages));
			next();
		}
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};
