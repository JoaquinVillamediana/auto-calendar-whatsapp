const express = require('express');
const router = express.Router();
const calendarService = require('../../services/calendar.service');

router.post('/process-query', async (req, res) => {
  try {
    const { query } = req.body;
    const result = await calendarService.processQuery(query);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process request' });
  }
});

module.exports = router; 