// Function to find the linked languages of the output language specified

module.exports = (outputLanguage) => {
	const languages = require('../data/languages-list.json');
	const languageLinks = require('../data/language-links.json');
	const soleLanguages = require('../data/sole-languages.json');

	// Checking if language links exist for the given language in languages
	// list generated from language-data.json
	var check1 = false;
	languages.forEach((language) => {
		if (language.toLowerCase() === outputLanguage.toLowerCase()) {
			check1 = true;
		}
	});
	if (check1) {
		var check2 = true;

		// Checking to see if the given language is a sole major language of a country
		soleLanguages.forEach((language) => {
			if (language.toLowerCase() === outputLanguage.toLowerCase()) {
				check2 = false;
			}
		});
		if (check2) {
			// Finding the linked languages
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

			// Linked languages returned
			return output;
		} else {
			// Only the output language returned
			return [outputLanguage];
		}
	} else {
		// Only the output language returned
		return [outputLanguage];
	}
};
