var PointsCore = require('../service/point-core');
var exRate = require('../service/exRate');
var config = require('../service/pointsConfig');
var MathUtil = require('../util/MathUtil');
var instance = require('../db/base');
var pointsHistory = require('../db/model/pointsHistory')
var playerPoints = require('../db/model/playPoints');
var Op = require('sequelize').Op;

describe('PointsCore', function () {
	beforeEach(function () {
		return instance.sync();
	});

	describe('#calculate cost from points', function () {
		it('for v level ', function (done) {
			var result = Promise.all([exRate.getExRate('NZD'), config()]);
			result.then(([exRate, c]) => {
				console.log('')
				var expected = MathUtil.accAdd((c.v_PpD * (100 * exRate * (1 - c.exRateFix))).toFixed(), c.v_extra)
				PointsCore.costToPoints(100, 'NZD', 'V').then(points => {
					if (expected == points) {
						console.log("expected:", expected, " actually:", points)
						done()
					} else {
						console.log("expected:", expected, " actually:", points)
						done("unmatch");
					}
				})
			}).catch(error => {
				done(error);
			});
		});

		it('for g level ', function (done) {
			var result = Promise.all([exRate.getExRate('NZD'), config()]);
			result.then(([exRate, c]) => {
				console.log('')
				var expected = MathUtil.accAdd((c.g_PpD * (100 * exRate * (1 - c.exRateFix))).toFixed(), c.g_extra)
				PointsCore.costToPoints(100, 'NZD', 'G').then(points => {
					if (expected == points) {
						console.log("expected:", expected, " actually:", points)
						done()
					} else {
						console.log("expected:", expected, " actually:", points)
						done("unmatch");
					}
				})
			}).catch(error => {
				done(error);
			});
		});

		it('for P level ', function (done) {
			var result = Promise.all([exRate.getExRate('NZD'), config()]);
			result.then(([exRate, c]) => {
				console.log('')
				var expected = MathUtil.accAdd((c.p_PpD * (100 * exRate * (1 - c.exRateFix))).toFixed(), c.p_extra)
				PointsCore.costToPoints(100, 'NZD', 'P').then(points => {
					if (expected == points) {
						console.log("expected:", expected, " actually:", points)
						done()
					} else {
						console.log("expected:", expected, " actually:", points)
						done("unmatch");
					}
				})
			}).catch(error => {
				done(error);
			});
		});

		it('for B level ', function (done) {
			var result = Promise.all([exRate.getExRate('NZD'), config()]);
			result.then(([exRate, c]) => {
				console.log('')
				var expected = MathUtil.accAdd((c.b_PpD * (100 * exRate * (1 - c.exRateFix))).toFixed(), c.b_extra)
				PointsCore.costToPoints(100, 'NZD', 'B').then(points => {
					if (expected == points) {
						console.log("expected:", expected, " actually:", points)
						done()
					} else {
						console.log("expected:", expected, " actually:", points)
						done("unmatch");
					}
				})
			}).catch(error => {
				done(error);
			});
		});
	})

	describe('#calculate points to cost', function () {
		it("for cost ", function (done) {
			Promise.all([exRate.getExRate('NZD'), config()])
				.then(([exRate, c]) => {
					var expected = (1000 * (c.pointToCents * exRate * (1 - c.exRateFix)) / 100).toFixed(0);
					PointsCore.pointsToCurrency(1000, 'NZD').then(m => {
						if (expected == m) {
							console.log("expected:", expected, " actually:", m)
							done()
						} else {
							console.log("expected:", expected, " actually:", m)
							done("unmatch");
						}
					})
				}).catch(error => {
					done(error);
				});

		})
	})

	describe("#process game to test", function () {

		beforeEach(function () {
			let players = 'pTestId1,pTestId2,pTestId3'.split(',')
			return Promise.all([pointsHistory.destroy({
				where: {
					playerId: {
						[Op.in]: players
					}
				}
			}), playerPoints.destroy({
				where: {
					playerId: {
						[Op.in]: players
					}
				}
			})]);
		})

		it("game for gain points", function (done) {
			let game = {
				id: 1,
				host: 'hostTestId',
				players: 'pTestId1,pTestId2,pTestId3',
				price: 100,
				currency: 'NZD'
			}
			Promise.all([exRate.getExRate('NZD'), config()])
				.then(([exRate, c]) => {
					var expected = MathUtil.accAdd((c.v_PpD * (100 * exRate * (1 - c.exRateFix))).toFixed(), c.v_extra)

					PointsCore.processGame(game).then(_ => {
						PointsCore.userPoints(game.players).then(userPoints => {
							let matching = 0
							game.players.split(',').forEach(p => {
								let userPoint = userPoints[p];
								if (userPoint.memberLevel === 'V' && userPoint.points == expected) {
									matching++;
								}else {
									console.log('unmatching:',userPoint.playerId ,':' , userPoint.points,' expected:', expected);
								}
							})
							if (matching === game.players.split(',').length) {
								done()
							} else {
								done('unmatch:', userPoints)
							}
						})
					})
				})
		});

		it("game for level to G", function (done) {
			let game = {
				id: 1,
				host: 'hostTestId',
				players: 'pTestId1,pTestId2,pTestId3',
				price: 100,
				currency: 'NZD'
			}
			Promise.all([exRate.getExRate('NZD'), config()])
				.then(([exRate, c]) => {
					var expected = MathUtil.accAdd((c.v_PpD * (100 * exRate * (1 - c.exRateFix))).toFixed(), c.v_extra)

					let tenGame = []
					for (let i = 0; i < 11; i++) {
						tenGame.push(PointsCore.processGame(game))
					}

					Promise.all(tenGame).then(_ => {
						PointsCore.userPoints(game.players).then(userPoints => {
							let matching = 0
							game.players.split(',').forEach(p => {
								let userPoint = userPoints[p];
								if (userPoint.memberLevel === 'G' && userPoint.points == expected * 11) {
									matching++;
								}else{
									console.log('unmatching points:',userPoint.playerId ,':' , userPoint.points,' expected:', expected * 11);
									console.log('unmatching memberLevel:',userPoint.playerId ,':' , userPoint.memberLevel,' expected:"G"');
								}
							})
							if (matching === game.players.split(',').length) {
								done()
							} else {
								done('unmatch:', userPoints)
							}
						})
					})
				})
		})
	})
})