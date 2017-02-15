var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});
var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			notEmpty: true,
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}

})

var User =  sequelize.define('user',
	{email : Sequelize.STRING});

User.hasMany(Todo);
Todo.belongsTo(User);

sequelize.sync({
	force: true
}).then(function() {
	console.log('everything in sync');
	User.create({
		email : 'gigil@gmail.com'})
	}).then(function()
	{
		Todo.create({
			description:'say hello'
		})
	}).then(function(todo){
		User.findById(1).then(function(user){
			user.addTodo(todo);
		})
		//user.getTodos({where :{completed :true}})
	})
	/*Todo.findById(3).then(function(todo){

		if(todo)
			console.log(todo.toJSON());
		else
			console.log('todo not founnd');
	}).catch(function(e)
	{
		console.log(e);
	})*/
	/*Todo.create({
		description: 'Walking my Dog'
			///completed: false
	}).then(function(todo) {
		return Todo.create({
			description: 'Shopping'
		});
	}).then(function(todo) {
		return Todo.findAll({
			where : {
				description: {

					like :'%shop%'
				}
			}

		});
	}).then(function(todos) {
		//console.log(todos);
		todos.forEach(function(todo)
		{
console.log(todo.toJSON());
		});

	}).catch(function(e) {
		console.log(e);
	});*/
});