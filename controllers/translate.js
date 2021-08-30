const { Translate } = require('@google-cloud/translate').v2;

const detect = require('../util/detect');
const languageLinker = require('../util/language-linker');

const InputLanguage = require('../models/input-language');
const OutputLanguage = require('../models/output-language');
const Data = require('../models/data');

const translate = new Translate();

exports.postTranslation = async (req, res, next) => {
	try {
		// Extracting input, inputLanguage and outputLanguage from body of request, checking for invalid values.
		const input = req.body.input;
		if (!input) {
			let error = new Error();
			error.statusCode = 422;
			error.message = 'Input cannot be null.';
			throw error;
		}
		let inputLanguage = req.body.inputLanguage;
		let outputLanguage = req.body.outputLanguage;
		if (!outputLanguage) {
			let error = new Error();
			error.statusCode = 422;
			error.message = 'Output language must be specified.';
			throw error;
		}

		// If the inputLanguage is blank or equal to detect language, then the language of input is
		// detected using google translate API
		var detectedLanguage;
		if (inputLanguage.toLowerCase() === 'detect language' || !inputLanguage) {
			detectedLanguage = await detect(input);
			inputLanguage = detectedLanguage.language;
		}

		// Checking if the input language and output language match any of the languages
		// listed in the google translate API.
		let inputLanguageCode,
			check1 = false,
			check2 = false;

		const [languages] = await translate.getLanguages();

		for (let i = 0; i < languages.length; i++) {
			if (
				languages[i].name.toLowerCase() === inputLanguage.toLowerCase() ||
				languages[i].code.toLowerCase() === inputLanguage.toLowerCase()
			) {
				inputLanguage = languages[i].name;
				inputLanguageCode = languages[i].code;
				check1 = true;
			}
			if (
				languages[i].name.toLowerCase() === outputLanguage.toLowerCase() ||
				languages[i].code.toLowerCase() === outputLanguage.toLowerCase()
			) {
				outputLanguage = languages[i].name;
				check2 = true;
			}
		}
		if (!check1) {
			let error = new Error();
			error.statusCode = 422;
			error.message = 'Invalid Input Language Selected';
			throw error;
		} else if (!check2) {
			let error = new Error();
			error.statusCode = 422;
			error.message = 'Invalid Output Language Selected';
			throw error;
		}

		// Generating the linked languages using language-data.json
		const outputLanguages = await languageLinker(outputLanguage);
		for (let i = 0; i < outputLanguages.length; i++) {
			if (outputLanguages[i].toLowerCase() === outputLanguage.toLowerCase()) {
				let temp = outputLanguages[0];
				outputLanguages[0] = outputLanguages[i];
				outputLanguages[i] = temp;
			}
		}
		console.log('Linked languages: ', outputLanguages);

		// Finding the ID of input language specified, from the inputLanguages table.
		let inputLanguagePk = await InputLanguage.findOne({
			where: {
				code: inputLanguageCode,
			},
		});
		inputLanguagePk = inputLanguagePk.dataValues.id;

		var results, output;
		for (output of outputLanguages) {
			let outputCode;

			// Finding the details of outputLanguage from the languages array, which contains the list of
			// languages provided by google translate
			for (let i = 0; i < languages.length; i++) {
				if (
					languages[i].name.toLowerCase() === output.toLowerCase() ||
					languages[i].code.toLowerCase() === output.toLowerCase()
				) {
					output = languages[i].name;
					outputCode = languages[i].code;
				}
			}

			// Finding the ID of output language specified, from the outputLanguages table.
			let outputPk = await OutputLanguage.findOne({
				where: {
					code: outputCode,
				},
			});
			outputPk = outputPk.dataValues.id;

			// Checking if the translation already exists in the database, otherwise
			// translating input using google translate API
			const translationStored1 = await Data.findOne({
				where: {
					originalString: input,
					outputLanguageId: outputPk,
				},
			});
			const translationStored2 = await Data.findOne({
				where: {
					translatedString: input,
					inputLanguageId: inputLanguagePk,
				},
			});

			// Sending response if the current output language matches the requested output language,
			// otherwise storing the data of linked languages in the database
			if (output.toLowerCase() === outputLanguage.toLowerCase()) {
				if (translationStored1) {
					results = [translationStored1.translatedString];
					console.log('Translation results from db:', results);
				} else if (translationStored2) {
					results = [
						'Translation results from db:',
						translationStored2.originalString,
					];
					console.log(results);
				} else {
					[results] = await translate.translate(input, outputCode);
					results = Array.isArray(results) ? results : [results];

					// Storing the translation data in the Data table
					await Data.create({
						originalString: input,
						translatedString: results[0],
						inputLanguageId: inputLanguagePk,
						outputLanguageId: outputPk,
					});
					console.log('Translation results stored:', results[0]);
				}

				// Sending json response of the translated string
				if (detectedLanguage) {
					res.status(200).json({
						translatedString: results[0],
						detectedLanguage: inputLanguage,
						outputLanguage: outputLanguage,
					});
				} else {
					res.status(200).json({
						translatedString: results[0],
						inputLanguage: inputLanguage,
						outputLanguage: outputLanguage,
					});
				}
			} else {
				if (!translationStored1 && !translationStored2) {
					[results] = await translate.translate(input, outputCode);
					results = Array.isArray(results) ? results : [results];

					// Storing the translation data of the linked languages in the Data table
					await Data.create({
						originalString: input,
						translatedString: results[0],
						inputLanguageId: inputLanguagePk,
						outputLanguageId: outputPk,
					});
					console.log(
						'Linked languages translation results stored:',
						results[0]
					);
				} else {
					if (translationStored1)
						console.log(
							'Linked language translation results from db: ',
							translationStored1.translatedString
						);
					else
						console.log(
							'Linked language translation results from db: ',
							translationStored2.originalString
						);
				}
			}
		}
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};
