const express = require('express');
const HealthController = require('../health/healthController');

const router = express.Router();


router.get('/health', HealthController.basicHealth);


router.get('/health/detailed', HealthController.detailedHealth);

router.get('/health/ready', HealthController.readiness);
router.get('/health/live', HealthController.liveness);

module.exports = router;