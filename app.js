var express = require('express');
var app = express();
var config = require('config');

app.set('port', config.get('port'));

var handlebars = require('express-handlebars')
	.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	let arr = ["This", "is", "array", "text"];
	res.render("home", { str : arr.join(" ") });
});

app.get('/about', function(req, res) {
	res.type('text/plain');
	res.send('Main page about');
});

// пользовательская страница 404
app.use(function(req, res){
	res.type('text/plain');
	res.status(404);
	res.send('404 — Не найдено');
});

// пользовательская страница 500
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.type('text/plain');
	res.status(500);
	res.send('500 — Ошибка сервера');
});

app.listen(app.get('port'), function(){
	console.log( 'Express запущен на http://localhost:' +
	app.get('port') + '; нажмите Ctrl+C для завершения.' );
});