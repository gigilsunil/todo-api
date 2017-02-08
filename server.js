var express = require('express');
var parser= require('body-parser');
var _ = require('underscore');

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
	res.json(todos);
});
//request.params.id
app.get('/todos/:id',function(req,res)
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
	res.json(matchedTodo);
else
	res.status(404).send();
});

app.post('/todos',function(req,res)
{
	var body = req.body;
	var pickedBody =_.pick(body,'description','completed');
	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length===0)
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
	res.json(todos);
});

app.get('/',function(req,res)
{
	res.send('Todo api root');
});

app.listen(PORT, function()
{
console.log('Express listening on port' + PORT);
});


