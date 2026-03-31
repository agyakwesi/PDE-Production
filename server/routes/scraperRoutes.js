const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');

router.post('/', scraperController.scrapeFragrantica);
router.post('/discovery', scraperController.discoverySearch);
router.post('/bulk', scraperController.bulkScrape);

module.exports = router;
