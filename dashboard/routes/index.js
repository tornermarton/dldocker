'use strict';

const express = require('express');
const sse = require('server-sent-events');
const router = express.Router();

const renderMW = require('../middleware/common/render');

const monitoringInfoMW = require('../middleware/monitoring/info');
const monitoringStreamMW = require('../middleware/monitoring/stream');

const objectRepository = {};

router.get('/',
    monitoringInfoMW(objectRepository),
    renderMW(objectRepository, "monitoring")
);

router.get('/monitoring/stream', sse,
    monitoringStreamMW(objectRepository)
);

module.exports = router;
