# Language-Translator

This project contains code for a backend server that exposes a REST API for translation of provided string from the specified input language/detected input language to the specified output language. It uses the google-cloud/translate API to do the translation. The translation data is cached in a SQL database for limiting calls to google-cloud/translate.

# Setup

If you install Node.js installation is easy, just run the following commands.

```
$ git clone https://github.com/raghav-dwivedi/language-translator.git
$ cd language-translator
$ npm install
```

This will clone the repository to your local machine and then install all the dependencies required by the project.

Create a .env file in the root of your project directory, and set the following environment variables:

1. DIALECT
2. GOOGLE_APPLICATION_CREDENTIALS
3. HOST
4. PORT
5. SQL_DATABASE
6. SQL_PASSWORD
7. SQL_PORT
8. SQL_USERNAME

Google application credentials can be generated from IAM configuration at console.google.com. Set the value of GOOGLE_APPLICATION_CREDENTIALS as path to the JSON file of your generated token. Use the links below to read more about google-cloud/translate API.

### Reference links:

https://www.npmjs.com/package/@google-cloud/translate

https://cloud.google.com/translate/docs/basic/translating-text

# Usage

To start the server, run the following command, in the root directory of your project:

```
$ npm start
```

Send POST requests to your server to get the translated string as JSON response. The structure of request body is:

```
req {
    body {
        input: (String to be translated),
        inputLanguage: (Language of input string),
        outputLanguage: (Language of output string)
    }
}
```

- _inputLanguage can also be "detect language" || empty, which will lead to detection of input language by the google-translate API._

&nbsp;

Send the POST request to the following URL

```
POST http://localhost:${PORT}/translate
```

# Design Decisions

## Structure of the API

- I employed MVC pattern in my code. It provides a great structure for writing scalable asynchronous code.
- Before routing to the controller handling the request, I added 2 middlewares, one for populating the inputLanguages and outputLanguages tables with language codes from google-cloud/translate API, if they are empty, and the other for generating files containing language links, if they don't already exist, using data from the language data provided. This ensures that the controller will have sufficient data to perform its operations.

## Database Schema

- The codes for input and output languages are stored in 2 separate tables.
- I decided to store the translation data in a single table instead of multiple tables for each and every combination of input and output languages as that would have required creation of an unsustainable number of tables based on the number of languages.
- The translations are linked to the input and output languages through columns that store the ids of these languages in the input and ouptut tables.

> You can find the schema for all the tables, in the models directory of the project.

&nbsp;

### **inputLanguages**

| id  | code |      createdAt      |      updatedAt      |
| :-: | :--: | :-----------------: | :-----------------: |
| 22  |  en  | 2021-08-28 08:51:04 | 2021-08-28 08:51:04 |

### **outputLanguages**

| id  | code |      createdAt      |      updatedAt      |
| :-: | :--: | :-----------------: | :-----------------: |
| 27  |  fr  | 2021-08-28 08:51:04 | 2021-08-28 08:51:04 |

### **Data Table**

| originalString |  translatedString  | inputLanguageId | outputLanguageId |      createdAt      |      updatedAt      |
| :------------: | :----------------: | :-------------: | :--------------: | :-----------------: | :-----------------: |
|  Sample Data   | Exemple de données |       22        |        27        | 2021-08-28 12:09:12 | 2021-08-28 12:09:12 |

&nbsp;

## Compilation of Language Data

- I compiled the language data used to create links between languages from wikipedia.org and worlddata.info/languages/index.php. I decided to list only the top 33 languages in the world by population.
- I selected only the countries for each language that had over 1 million speakers of that language or a significant percentage of the country spoke that language.

## Creation of Links Between languages

- First I generated data that contained the major languages for each country. These languages and countries were taken from the data I compiled.
- After that I removed the countries and converted the data into an array of arrays of languages. I then removed the duplicate entries from this array of arrays.
- Now the data that I had left contained a lot of arrays of languages of length 1, this implied these languages were the only main languages of some countries, hence linking them with other languages would result in unnecessary translations being stored.
- For better linking of data, location of user is necessary. This would ensure that the translations stored are of the linked languages of the given country.
- For example English and French are the most widely used languages of the world. If I were to store translations of all the languages of the countries where these languages are used, I would end up storing every single language in the data I compiled.

# Future Improvements

- Storing translations of linked languages based on the location of the user.
- Currently there is no functionality to recreate helper data based on the changes in the language data. Temporary solution is through deletion of data/language-links.json, which would trigger re-creation of all 3 helper data files.

# Issues

- Currently languages like Malay, which are the major languages of multiple countries but is not the sole major language of any country, are getting their linked languages combined together and causing a few unnecessary translations getting stored. This issue can be resolved if location data is used to aid in determining the language links.
