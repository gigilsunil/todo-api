var express = require('express');
var parser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var nextId = 1;
/*
{
	id : 1,
	description : 'to learn',
	completed : false
},
{
	id : 2,
	description : 'shopping',
	completed : true
},
{
	id : 3,
	description : 'post the letter',
	completed : false
}];*/
app.use(parser.json());
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var queryParams = req.query;
	//var filteredTodos = todos;
	var where = {
		userId: req.user.get('id')
	};
	if (queryParams.hasOwnProperty('completed') && queryParams.completed == 'true') {
		where.completed = true;
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed == 'false') {
		where.completed = false;
	}

	if (queryParams.hasOwnProperty('desc') && queryParams.trim().length > 0) {
		where.description = {
			like: '%' + queryParams.desc + '%'
		}
	}
	db.todo.findAll({
		where: where
	}).then(function(todos) {
		//console.log(todo);
		//console.log(!todo);
		if (todos) {
			res.send(todos);
		} else {
			res.status(404).send();
		}

	}, function(e) {
		res.status(500).json(e);
	});

	/*if(queryParams.hasOwnProperty('completed') && queryParams.completed == 'true')
	{
		filteredTodos = _.where(filteredTodos,{completed:true})
	}
	else if(queryParams.hasOwnProperty('completed') && queryParams.completed == 'false')
	{
		filteredTodos = _.where(filteredTodos,{completed:false})
	}*/

	//res.json(filteredTodos);
});

//request.params.id
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var idChk = parseInt(req.params.id, 10);
	console.log(idChk);
	db.todo.findOne({
		where: {
			id: idChk,
			userId: req.user.get('id')
		}
	}).then(function(todo) {
		//console.log(todo);
		//console.log(!todo);
		if (todo) {
			res.send(todo.toJSON());
		} else {
			res.status(404).send();
		}

	}, function(e) {
		res.status(500).json(e);
	});

	// matchedTodo = _.findWhere(todos,{id:idChk});
	/*todos.forEach(function(x)
	{
		matchedId =0;
		if(typeof x == 'object' && x.id === id)
		{
			matchedId=1;
			res.json(x);

		}
	});
	if(matchedId === 0)
	{
		res.status(404).send();
	}*/
	/*if(matchedTodo)
	res.json(matchedTodo);
else
	res.status(404).send();//res.status(404).json({"error":"bad request"})*/
});
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var idChk = parseInt(req.params.id, 10);
	db.todo.destroy({
			where: {
				id: idChk,
				userId: req.user.get('id')
			}
		}).then(function(x) {
			if (x === 1) {
				res.send("Row deleted");
			} else {
				res.status(404).send("No id");
			}
		}, function(e) {
			res.status(500).json(e);
		})
		/*var matchedTodo = _.findWhere(todos,{id:idChk});
		todos.forEach(function(x)
		{
			matchedId =0;
			if(typeof x == 'object' && x.id === id)
			{
				matchedId=1;
				res.json(x);

			}
		});
		if(matchedId === 0)
		{
			res.status(404).send();
		}
		if(matchedTodo)
		{
		todos = _.without(todos,matchedTodo);*/
		/*res.json(todos);
}
else
	res.status(404).json({"error":"bad request"})*/
});

app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	var idChk = parseInt(req.params.id, 10);
	var validAttributes = {};
	if (body.hasOwnProperty('completed')) {
		validAttributes.completed = body.completed;
	}
	/*else if(body.hasOwnProperty('completed'))
	{
		res.status(404).send();
	}*/
	if (body.hasOwnProperty('description')) {
		validAttributes.description = body.description;
	}


	db.todo.findOne({
		where: {
			id: idChk,
			userId: req.user.get('id')
		}
	}).then(function(todo) { //findById(),findOne - model method
		if (todo) {
			todo.update(validAttributes).then(function(todo) { //update() - is an instance method called on an individual todo method
				res.send(todo.toJSON());
			}, function(e) {
				res.send(e);
			});
		} else
			res.status(404).send();
	}, function() {
		res.status(500).send();
	}).catch(function(error) {
		res.send(error);
	});
	/*var matchedTodo = _.findWhere(todos,{id:idChk});
	if(matchedTodo)
	{	
		_.extend(matchedTodo,validAttributes);//copy all the values from the sourse to the detinationyhis will update the array,
		//Javascript objects are pased by reference, not by value.
		res.json(todos);
	}*/

});

app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = req.body;
	var pickedBody = _.pick(body, 'description', 'completed');

	db.todo.create(pickedBody).then(function(todo) {
		if (todo) {
			req.user.addTodo(todo).then(function() {
				return todo.reload();
			}).then(function() {
				res.send(todo.toJSON());
			});
		} else
			res.status(404).json({
				"error": "bad request"
			});
	}, function(e) {
		res.status(400).json(e);
	});
	/*if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length===0)
	{
		res.status(400).send();
	}
	//console.log(body);
	//var object = JSON.parse(body);
	//console.log(object);
	pickedBody.id = nextId++;
	pickedBody.description = pickedBody.description.trim();
	todos.push(pickedBody);
	//console.log(body.description);
	res.json(todos);*/
});
app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	console.log(body);
	db.user.create(body).then(function(user) {
		if (user) {
			//console.log(user);
			res.send(user.toPublicJSON());
		} else
			res.status(404).json({
				"error": "bad request"
			});
	}, function(e) {
		res.status(400).json(e);
	});
});
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	//var userInstance;

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');

		if (token) {
			console.log(token);
			db.token.create({
				token: token
			}).then(function(tokenInstance) {
				//console.log(token);
				res.header('Auth', tokenInstance.get('token')).json(user.toPublicJSON());
			}).catch(function(e) {
				console.log(e);
			})

		} else
			res.status(401).json();
	}, function(e) {
		res.status(401).json(e);
	});
	/*if (typeof body.email === 'string' && typeof body.password === 'string') {
		db.user.findOne({
			where :{
				'email' : body.email
				
			}
		}).then(function(user)
		{
			console.log(user);
			if(!user || !bcrypt.compareSync(body.password,user.get('password_hash')))
				return res.status(401).send();
			//else
			res.send(user.toPublicJSON());

		},function(user)
		{
			res.status(500).send();
		})
		//res.json(body);
	} else
		res.status(400).send();

*/
});
app.delete('/users/logout',middleware.requireAuthentication, function(req, res) {
	//console.log(req.token.get('hashToken')); when set req.token=tokenInstance in middleware.js
//req.token.destroy().then(function(row) {
	db.token.destroy({
		where: {
			hashToken: req.token
		}
	}).then(function(row) {
		res.status(204).send();
	}).catch(function(e) {
		res.status(500).send();
	})

});


app.get('/', function(req, res) {
	res.send('Todo api root');
});
db.sequelize.sync({
	force: true
}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port' + PORT);
	});
});