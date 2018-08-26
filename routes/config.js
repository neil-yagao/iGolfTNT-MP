var express = require('express');
var router = express.Router();
var config = require('../service/pointsConfig');
var configDB = require('../db/model/config');

/* GET home page. */
router.get('/', function (req, res, next) {
	config().then(config => {
		res.json({
			success: true,
			data: config
		})
	})

});

router.post('/', function (req, res, next) {
	var configObject = req.body;
	config().then(config => {
		configDB.destroy({
			where: {
				id: config.id
			}
		}).then( _ =>{
			delete configObject.id;
			delete configObject.deletedAt;
			configDB.create(configObject).then(object =>{
				res.json({
					data:object,
					success:true
				})
			})
			
		})
	})
});

module.exports = router;