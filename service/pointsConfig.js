var pointsConfig = require('../db/model/config');

function findConfig(){
	return pointsConfig.findOne({
		order:[['createdAt', 'DESC']]
	})
}

module.exports = findConfig;