var http = require("http");
var config = require('../conf/app');
var exRate = require('../db/model/exRate');
var moment = require('moment');

/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */

const options = new URL(config.xRate.api_enpoint);
var exChangeRateCache = {};
var updateDate = '';

function handleExrate(rate, exsited) {
	let atuRate = rate.USD / rate.AUD;
	let ntuRate = rate.USD / rate.NZD;
	let ytuRate = rate.USD / rate.CNY;
	if (!exsited) {
		let rates = [];
		rates.push(toRate(atuRate, 'AUD'));
		rates.push(toRate(ntuRate, 'NZD'));
		rates.push(toRate(ytuRate, 'CNY'));
		exRate.bulkCreate(rates);
	}
	updateDate = moment().format('YYYY-MM-DD')
	exChangeRateCache = {
		'AUD': atuRate,
		'NZD': ntuRate,
		'CNY': ytuRate
	}
}

function toRate(rate, currency) {
	return {
		currency: currency,
		exRate: rate,
		date: moment().format('YYYY-MM-DD')
	}
}

function queryExrate() {
	return new Promise(function (resolve, reject) {
		var req = http.request(options, function (res) {
			var output = '';
			res.setEncoding('utf8');

			res.on('data', function (chunk) {
				output += chunk;
			});

			res.on('end', function () {
				var obj = JSON.parse(output);
				console.log('obj', obj)
				if (obj.success) {
					handleExrate(obj.rates);
					resolve(obj.rates);
				} else {
					reject(obj);
				}
			});
		});

		req.on('error', function (err) {
			//res.send('error: ' + err.message);
			reject(err);
		});

		req.end();
	});

}

async function getExRate(currency) {
	if (!updateDate) {
		await exRate.findAll({
			where: {
				'date': moment().format('YYYY-MM-DD')
			}
		}).then(rates => {
			if (rates && rates.length > 0) {
				rates.forEach(function (r) {
					exChangeRateCache[r.currency] = Number(r.exRate);
				})
				console.log('rate', exChangeRateCache);
				return exChangeRateCache;	
			} else {
				return queryExrate();
			}

		})
	}
	console.log('get currency:',currency,' from ', exChangeRateCache)
	return exChangeRateCache[currency] ? exChangeRateCache[currency] : 1
}

module.exports = {
	queryExRate: queryExrate,
	getExRate: getExRate
};