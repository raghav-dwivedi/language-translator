const { Translate } = require('@google-cloud/translate').v2;

const translate = new Translate();

module.exports = async (text) => {
	let [detect] = await translate.detect(text);
	detect = Array.isArray(detect) ? detect : [detect];
	console.log('Language detected:', detect);
	const detectedLanguage = detect[0];
	return detectedLanguage;
};
