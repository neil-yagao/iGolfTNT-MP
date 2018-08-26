var Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		allowNull: false,
		unique: true,
		primaryKey: true
	},
	extra: {
		type: Sequelize.STRING
	},
	isActive: {
		type: Sequelize.BOOLEAN,
		default: true
	}
};