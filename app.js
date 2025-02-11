const express = require('express');
var cookieParser = require('cookie-parser');
var cors = require('cors');

//importo router
// var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

var app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

app.use(cookieParser());
app.use(cors());

app.use(function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", process.env.FRONTEND_BASE_URL);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use('/api', apiRouter);
// app.use('/', indexRouter);

const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

module.exports = app;