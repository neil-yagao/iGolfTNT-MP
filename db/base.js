var Sequelize = require('sequelize');
var config =require('../conf/app');

const sequelize = new Sequelize('iGolf','iGolf','golfTNT@20180707',{
	host:config.db.host,
	dialect:'mysql',
	logging: console.log,
});

module.exports = sequelize;