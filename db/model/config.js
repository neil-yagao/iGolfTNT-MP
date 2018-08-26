var instance = require('../base');
var Sequelize = require('sequelize');
var Base = require('./base');
var assign = require('lodash/assign');
var Sequelize = require('sequelize');

/**
 * PpD = points per Dollar
 */
var pointsConfig = assign({}, {
	v_extra: Sequelize.INTEGER,
	g_extra: Sequelize.INTEGER,
	p_extra: Sequelize.INTEGER,
	b_extra: Sequelize.INTEGER,
	v_PpD: Sequelize.INTEGER,
	g_PpD: Sequelize.INTEGER,
	p_PpD: Sequelize.INTEGER,
	b_PpD: Sequelize.INTEGER,
	exRateFix: Sequelize.DECIMAL(10, 5),
	pointToCents: Sequelize.INTEGER
}, Base);

const PointsConfig = instance.define('points-config',
	pointsConfig, {
		timestamps: true,
		paranoid: true
	}
);

PointsConfig.sync({force:true}).then(() => {
	PointsConfig.create({
		v_extra: 0,
		g_extra: 20,
		p_extra: 40,
		b_extra: 60,
		v_PpD: 1,
		g_PpD: 2,
		p_PpD: 3,
		b_PpD: 4,
		exRateFix: 0.05,
		pointToCents: 3
	})
});

module.exports = PointsConfig;