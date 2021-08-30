// Function to detect the input language using google translate API

const { Translate } = require('@google-cloud/translate').v2;

const translate = new Translate();

module.exports = async (text) => {
	try {
		let [detect] = await translate.detect(text);
		detect = Array.isArray(detect) ? detect : [detect];
		console.log('Language detected:', detect);
		const detectedLanguage = detect[0];
		return detectedLanguage;
	} catch (error) {
		console.log(error);
	}
};
