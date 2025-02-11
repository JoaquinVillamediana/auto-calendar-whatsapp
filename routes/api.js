/**ROUTE USER APIs. */
var express = require('express')

var router = express.Router()
var calendar = require('./api/calendar.route')

function logRequest(req, res, next) {
  console.log(`${new Date()} - [${req.method}] ${req.originalUrl}`);
  if(req.method !== "GET")
    console.log(req.body)
  next();
}

router.use('/calendar', logRequest, calendar);

module.exports = router;