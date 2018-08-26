var express = require('express');
var router = express.Router();

var memberPoints = require('../service/point-core');
/* GET users listing. */
router.post('/', function (req, res, next) {
	let games = req.body;
	let gamePromise = [];
	games.forEach(game => {
		gamePromise.push(memberPoints.processGame(game));
	})
	Promise.all(gamePromise).then(_ => {
		res.json({
			success: true,
			data: {}
		})
	})
});

router.get('/', function (req, res) {
	memberPoints.userPoints().then(up => {
		res.json({
			success: true,
			data: up
		})
	})
})


const queryGames = `
	query GameByDate($date:String){
		gameByDate(date:$date){
			id
			hostId
			players
			price
			currency
		}
	}
`

module.exports = router;