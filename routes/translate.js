const express = require('express');

const router = express.Router();

const translationController = require('../controllers/translate');

router.post('/translate', translationController.postTranslation);

module.exports = router;
