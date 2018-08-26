var instance = require('../base');
var Sequelize = require('sequelize');
var Base = require('./base');
var assign = require('lodash/assign');
var Sequelize = require('sequelize');

var playPointsHistory = assign({}, {
	playerId:Sequelize.STRING,
	points:Sequelize.DECIMAL(20,2),
	action:Sequelize.STRING/**ADD/COST */,
	actionRefId:Sequelize.STRING,
	actionDate:Sequelize.STRING
},Base);

const PlayPointsHistory = instance.define('player-points-history',
    playPointsHistory,{
        timestamps:true,
        paranoid:true
    }
);

PlayPointsHistory.sync();

module.exports = PlayPointsHistory;