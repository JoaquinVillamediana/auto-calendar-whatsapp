/**ROUTE USER APIs. */
import express from 'express';
import calendar from './api/calendar.route.js';

const router = express.Router();

function logRequest(req, res, next) {
  console.log(`${new Date()} - [${req.method}] ${req.originalUrl}`);
  if(req.method !== "GET")
    console.log(req.body)
  next();
}

router.use('/calendar', logRequest, calendar);

export default router;