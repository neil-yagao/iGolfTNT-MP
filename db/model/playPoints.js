var instance = require('../base');
var Sequelize = require('sequelize');
var Base = require('./base');
var assign = require('lodash/assign');
var Sequelize = require('sequelize');

var playPoints = assign({}, {
	playerId:Sequelize.STRING,
	playerName:Sequelize.STRING,
	memberLevel:Sequelize.STRING,
	points:Sequelize.DECIMAL(20,2),
},Base);

const PlayPoints = instance.define('player-points',
    playPoints,{
        timestamps:true,
		indexes: [{
			unique: true,
			fields: ['playerId']
		}],
    }
);

PlayPoints.sync();

module.exports = PlayPoints;