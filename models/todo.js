//models here
module.exports=function(sequelize, Datatypes)
{
	return sequelize.define('todo', {
	description: {
		type: Datatypes.STRING,
		allowNull: false,
		validate: {
			notEmpty: true,
			len: [1, 250]
		}
	},
	completed: {
		type: Datatypes.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}

});
};