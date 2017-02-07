var express = require('express');
var app = express();
var PORT = process.env.PORT ||3000;
var todos = [
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
}];

app.get('/todos',function(req,res)
{
	res.json(todos);
});
//request.params.id
app.get('/todos/:id',function(req,res)
{
	var id = parseInt(req.params.id);
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
});

app.get('/',function(req,res)
{
	res.send('Todo api root');
});

app.listen(PORT, function()
{
console.log('Express listening on port' + PORT);
});


