var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var exRate = require('./service/exRate');
var app = express();
var CronJob = require('cron').CronJob;
var cors = require('cors');

var configRouter = require('./routes/config');
var memberPointsRouter = require('./routes/memberPoints');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
	extended: false
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())
app.options('*', cors()) 

app.use('/config', configRouter);
app.use('/points', memberPointsRouter);


const job = new CronJob('00 30 00 * * *', function () {
	const d = new Date();
	console.log('onTick:', d);
	exRate.queryExRate();

});
job.start();

module.exports = app;