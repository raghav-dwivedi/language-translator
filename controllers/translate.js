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
			error.statusCode = 204;
			error.message = 'Input cannot be null.';
			throw Error(error);
		}
		let inputLanguage = req.body.inputLanguage;

		// If the inputLanguage is blank or equal to detect language, then the language of input is detected using google translate API
		if (inputLanguage.toLowerCase() === 'detect language' || !inputLanguage) {
			const detectedLanguage = await detect(input);
			inputLanguage = detectedLanguage.language;
		}

		let outputLanguage = req.body.outputLanguage;
		if (!outputLanguage) {
			let error = new Error();
			error.statusCode = 204;
			error.message = 'Output language must be specified.';
			throw Error(error);
		}

		// Checking if the input language and output language match any of the languages listed in the google translate API.
		let inputLanguageCode,
			outputLanguageCode,
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
			throw new Error('Invalid Input Language Selected');
		} else if (!check2) {
			throw new Error('Invalid Output Language Selected');
		}
		const outputLanguages = languageLinker(outputLanguage);
		console.log(outputLanguages);

		// Finding the IDs of languages inputted, from the input and output language table.
		let inputLanguagePk = await InputLanguage.findOne({
			where: {
				code: inputLanguageCode,
			},
		});
		inputLanguagePk = inputLanguagePk.dataValues.id;

		var results;
		for (output of outputLanguages) {
			let outputCode;
			console.log(output);
			for (let i = 0; i < languages.length; i++) {
				if (
					languages[i].name.toLowerCase() === output.toLowerCase() ||
					languages[i].code.toLowerCase() === output.toLowerCase()
				) {
					output = languages[i].name;
					outputCode = languages[i].code;
					check2 = true;
				}
			}
			let outputPk = await OutputLanguage.findOne({
				where: {
					code: outputCode,
				},
			});
			outputPk = outputPk.dataValues.id;

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

			// Checking if the translation already exists in the database otherwise translating input using google translate API
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
					console.log('Translation results:', results);

					// Storing the translation data in the Data table
					await Data.create({
						originalString: input,
						translatedString: results[0],
						inputLanguageId: inputLanguagePk,
						outputLanguageId: outputPk,
					});
				}
			} else {
				if (!translationStored1 && !translationStored2) {
					[results] = await translate.translate(input, outputCode);
					results = Array.isArray(results) ? results : [results];
					console.log('Linked languages translation results:', results);

					// Storing the translation data in the Data table
					await Data.create({
						originalString: input,
						translatedString: results[0],
						inputLanguageId: inputLanguagePk,
						outputLanguageId: outputPk,
					});
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

		// Sending json response of the translated string
		await res.status(200).json({
			translatedString: results[0],
			inputLanguage: inputLanguage,
			outputLanguage: outputLanguage,
		});
	} catch (error) {
		console.log(error);
	}
};
