var instance = require('../base');
var Sequelize = require('sequelize');
var Base = require('./base');
var assign = require('lodash/assign');
var Sequelize = require('sequelize');

var exRate = assign({}, {
	currency:Sequelize.STRING,
	exRate:Sequelize.DECIMAL(20,12),
	date:Sequelize.STRING,
},Base);
const ExRate = instance.define('ex-rate',
    exRate,{
        timestamps:true,
        paranoid:true,
		indexes: [{
			unique: true,
			fields: ['currency','date']
		}],
    }
);

ExRate.sync();

module.exports = ExRate;