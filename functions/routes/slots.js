const express = require('express');
const router = express.Router();
const { getSlots, bookSlot } = require('../api/slots');

// GET /api/slots - Get available slots for a guide
router.get('/', getSlots);

// POST /api/slots/book - Book a slot
router.post('/book', bookSlot);

module.exports = router;
