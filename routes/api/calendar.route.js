import express from 'express';
import calendarService from '../../services/calendar.service.js';

const router = express.Router();

router.post('/process-query', async (req, res) => {
  try {
    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required and must be a string' });
    }

    const result = await calendarService.processQuery(query);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Failed to process request' });
  }
});

export default router; 