const fs = require('fs');

const countriesByLanguage = require('../data/language-data.json');
const languagesByCountry = './data/language-links.json';

module.exports = (res, req, next) => {
	if (fs.existsSync(languagesByCountry)) {
		next();
	} else {
		const languagesData = [];
		const countryLanguage = [];
		for (var key in countriesByLanguage) {
			languagesData.push(key);
		}
		languagesData.forEach((language) => {
			for (let i = 0; i < countriesByLanguage[language].length; i++) {
				let check = true;
				countryLanguage.forEach((data) => {
					if (data.country === countriesByLanguage[language][i]) {
						data.languages.push(language);
						check = false;
					}
				});
				if (check) {
					countryLanguage.push({
						country: countriesByLanguage[language][i],
						languages: [language],
					});
				}
			}
		});
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
		let languages = new Set();
		uniqueLanguageLinks.forEach((languageArray) => {
			languageArray.forEach((language) => {
				console.log(language);
				languages.add(language);
			});
		});
		languages = [...languages];
		fs.writeFileSync('data/languages-list.json', JSON.stringify(languages));
		next();
	}
};
