var exRate = require('./exRate');
var config = require('./pointsConfig')
var MathUtil = require('../util/MathUtil');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;
var pointsHistory = require('../db/model/pointsHistory')
var playerPoints = require('../db/model/playPoints');
var instance = require('../db/base');
var moment = require('moment');

function userMemberLevel(userIds) {
	return playerPoints.findAll({
		where: {
			playerId: {
				[Op.in]: userIds
			}
		}
	}).then(players => {
		let result = {};
		if (players && players.push && players.length > 0) {
			players.forEach(p => {
				result[p.playerId] = p.memberLevel
			})
		}
		let newUsers = [];
		userIds.forEach(i => {
			if (!result[i]) {
				result[i] = 'V';
				//create new one
				newUsers.push({
					playerId: i,
					playerName: '',
					memberLevel: 'V',
					points: 0
				})
			}
		})
		if (newUsers.length > 0) {
			return playerPoints.bulkCreate(newUsers).then(_ => {
				return result;
			}).catch(error => {
				return result;
			})
		} else {
			return result;
		}
	})
}

function costToPoints(cost, currency, memberLevel) {
	return Promise.all([exRate.getExRate(currency), config()])
		.then(([exRate, c]) => {
			switch (memberLevel) {
				case 'V':
					return MathUtil.accAdd((c.v_PpD * (cost * exRate * (1 - c.exRateFix))).toFixed(), c.v_extra);
				case 'G':
					return MathUtil.accAdd((c.g_PpD * (cost * exRate * (1 - c.exRateFix))).toFixed(), c.g_extra);
				case 'P':
					return MathUtil.accAdd((c.p_PpD * (cost * exRate * (1 - c.exRateFix))).toFixed(), c.p_extra);
				case 'B':
					return MathUtil.accAdd((c.b_PpD * (cost * exRate * (1 - c.exRateFix))).toFixed(), c.b_extra);

			}
		})
}

function pointsToCurrency(points, currency) {
	return Promise.all([exRate.getExRate(currency), config()])
		.then(([exRate, c]) => {
			return (points * (c.pointToCents * exRate * (1 - c.exRateFix)) / 100).toFixed(0);
		});
}

/**
 * game :{
 * 		id:'',
 * 		hostId:'',
 * 		players:'id,id,id',
 * 		price:100,
 * 		currency:'NZD'
 * }
 */

function processGame(game) {
	let players = game.players.split(',')
	return userMemberLevel(players).then(playerLevel => {
		//caculate points based on user current memeber level
		let gamePoints = {}
		let promiseList = []
		players.forEach(pId => {
			promiseList.push(costToPoints(game.price, game.currency, playerLevel[pId]));
		})
		return Promise.all(promiseList).then(result => {
			for (let i = 0; i < players.length; i++) {
				let player = players[i];
				gamePoints[player] = result[i];
			}
			return gamePoints;
		})
	}).then(gamePoints => {
		//store game action in points history
		return instance.transaction({
			isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
		}, function (t) {
			let pointsActions = [];
			let updateActions = [];
			players.forEach(p => {
				pointsActions.push({
					playerId: p,
					points: Number(gamePoints[p]),
					action: 'ADD',
					actionRefId: game.id,
					actionDate: moment().format('YYYY-MM-DD')
				})
				updateActions.push(playerPoints.update({
					points: instance.literal('points + ' + gamePoints[p])
				}, {
					where: {
						playerId: p
					},
					transaction: t
				}))
			});
			updateActions.push(pointsHistory.bulkCreate(pointsActions, {
				transaction: t
			}));
			return Promise.all(updateActions);
		})
	}).then(_ => {
		//based on stored history update players member level; 
		return updateUserMemberLevel(players);
	})
}

function updateUserMemberLevel(players) {
	let actionHistory = []
	players.forEach(p => {
		actionHistory.push(pointsHistory.count({
			where: {
				playerId: p,
				action: 'ADD'
			}
		}))
	})
	return Promise.all(actionHistory).then(result => {
		let updateActions = []
		for (let i = 0; i < players.length; i++) {
			let playerGame = result[i];
			console.log('player:',players[i],' ', playerGame);
			let memberLevel = 'V'
			if (playerGame > 10 && playerGame <= 25) {
				memberLevel = 'G'
			} else if (playerGame > 25) {
				memberLevel = 'P'
			}
			updateActions.push(playerPoints.update({
				memberLevel: memberLevel
			}, {
				where: {
					playerId: players[i]
				}
			}))
		}
		return Promise.all(updateActions);
	})
}

function userPoints(userId) {
	let condition = {};
	if (userId) {
		condition = {
			where: {
				playerId: {
					[Op.in]: userId.split(',')
				}
			}
		}
	}
	return playerPoints.findAll(condition).then(pp => {
		let result = {};
		pp.forEach(p => {
			result[p.playerId] = p;
		});
		return result;
	})
};

module.exports = {
	costToPoints,
	pointsToCurrency,
	processGame,
	userPoints
};