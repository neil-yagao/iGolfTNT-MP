module.exports = {
	xRate:{
		"api_key":'6c37da534737a4c78d13c9d5185426dc',
		"api_enpoint":"http://data.fixer.io/api/latest?access_key=6c37da534737a4c78d13c9d5185426dc&symbols=USD,AUD,NZD,CNY"
	},
	db:{
		host:process.env.MYSQL_URL || 'localhost',
		port:'3306',
		userName:'iGolf',
		password:'golfTNT@20180707',
		name:'iGolf',
		dialect:'mysql'
	},
}