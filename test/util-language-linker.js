const expect = require('chai').expect;

const languageLinker = require('../util/language-linker');

describe('Language Linker Util', function () {
	it('should return the outputLanguage if the language does not exist in language list', function () {
		const outputLanguage = 'abc';
		const [output] = languageLinker(outputLanguage);
		expect(output).to.equal('abc');
	});

	it('should return the output language if the outputLanguage is a sole language', function () {
		const outputLanguage = 'English';
		const [output] = languageLinker(outputLanguage);
		expect(output).to.equal('English');
	});

	it('should return an array of languages of length >1 if the outputLanguage is not a sole language', function () {
		const outputLanguage = 'Malay';
		expect(languageLinker(outputLanguage)).to.be.an('array');
		expect(languageLinker(outputLanguage)).to.have.lengthOf.above(1);
	});
});
