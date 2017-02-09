var express = require('express');
var parser= require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT ||3000;
var todos = [];
var nextId =  1;
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
app.get('/todos',function(req,res)
{
	var queryParams = req.query;
	var filteredTodos = todos;

	if(queryParams.hasOwnProperty('completed') && queryParams.completed == 'true')
	{
		filteredTodos = _.where(filteredTodos,{completed:true})
	}
	else if(queryParams.hasOwnProperty('completed') && queryParams.completed == 'false')
	{
		filteredTodos = _.where(filteredTodos,{completed:false})
	}


	res.json(filteredTodos);
});

//request.params.id
app.get('/todos/:id',function(req,res)
{
	var idChk = parseInt(req.params.id,10);
	console.log(idChk);
	db.todo.findById(idChk).then(function(todo)
	{
		//console.log(todo);
		//console.log(!todo);
		if(todo)
		{
			res.send(todo.toJSON());
		}
		else
		{
			res.status(404).send();
		}
		
	},function(e)
	{
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
app.delete('/todos/:id',function(req,res)
{
	var idChk = parseInt(req.params.id,10);
	var matchedTodo = _.findWhere(todos,{id:idChk});
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
	if(matchedTodo)
	{
	todos = _.without(todos,matchedTodo);
	res.json(todos);
}
else
	res.status(404).json({"error":"bad request"})
});

app.put('/todos/:id',function(req,res)
{
	var body =_.pick(req.body,'description','completed');
	var idChk = parseInt(req.params.id,10);
	var matchedTodo = _.findWhere(todos,{id:idChk});
	if(!matchedTodo)
	{	
		res.status(404).json({"error":"bad request"});
		}
	var validAttributes={};
	if(body.hasOwnProperty('completed')&& _.isBoolean(body.completed))
	{
		validAttributes.completed=body.completed;
	}
	else if(body.hasOwnProperty('completed'))
	{
		res.status(404).send();
	}
	if(body.hasOwnProperty('description') && _.isString(body.description))
	{
		validAttributes.description=body.description;
	}
	if(body.hasOwnProperty('description'))
	{
		res.status(404).send();
	}
	var idChk = parseInt(req.params.id,10);
	var matchedTodo = _.findWhere(todos,{id:idChk});
	if(matchedTodo)
	{	
		_.extend(matchedTodo,validAttributes);//yhis will update the array,
		//Javascript objects are pased by reference, not by value.
		res.json(todos);
	}

});

app.post('/todos',function(req,res)
{
	var body = req.body;
	var pickedBody =_.pick(body,'description','completed');

	db.todo.create(pickedBody).then(function(todo){
		if(todo)
			res.send(todo.toJSON());
		else
			res.status(404).json({"error":"bad request"});
	},function(e)
	{
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

app.get('/',function(req,res)
{
	res.send('Todo api root');
});
db.sequelize.sync().then(function()
{
	app.listen(PORT, function()
	{
	console.log('Express listening on port' + PORT);
	});
});



