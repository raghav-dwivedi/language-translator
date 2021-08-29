const languages = require('../data/languages-list.json');
const languageLinks = require('../data/language-links.json');
const soleLanguages = require('../data/sole-languages.json');

module.exports = (outputLanguage) => {
	var check1 = false;
	languages.forEach((language) => {
		if (language.toLowerCase() === outputLanguage.toLowerCase()) {
			check1 = true;
		}
	});
	if (check1) {
		var check2 = true;
		soleLanguages.forEach((language) => {
			if (language.toLowerCase() === outputLanguage.toLowerCase()) {
				check2 = false;
			}
		});
		if (check2) {
			let output = new Set();
			languageLinks.forEach((languageArray) => {
				languageArray.forEach((language) => {
					if (language.toLowerCase() === outputLanguage.toLowerCase()) {
						for (let item of languageArray) {
							output.add(item);
						}
					}
				});
			});
			output = [...output];
			return output;
		} else {
			return [outputLanguage];
		}
	} else {
		return [outputLanguage];
	}
};
