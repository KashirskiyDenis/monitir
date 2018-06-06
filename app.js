var express = require('express');
var app = express();
var config = require('config');
var fs = require('fs');
var handlebars = require('helpers')();

app.set('port', config.get('port'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	let title = "Main page site";
	res.render("home", {
		objects: config.get('objects'),
		title: title,
		layout: 'main'
	});
});

app.get('/about', function (req, res) {
	res.type('text/plain');
	res.send('Main page about');
});

// пользовательская страница 404
app.use(function (req, res) {
	res.type('text/plain');
	res.status(404);
	res.send('404 — Не найдено');
});

// пользовательская страница 500
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.type('text/plain');
	res.status(500);
	res.send('500 — Ошибка сервера');
});

// fs.watchFile(__dirname + '/data/data.json', (curr, prev) => {
// 	console.log(curr);
// });

var http = require('http');
var server = http.createServer(app);
var WebSocket = require('ws');
var wss = new WebSocket.Server({ server });


server.listen(app.get('port'), function () {
	console.log('Express запущен на http://localhost:' + app.get('port') + '; нажмите Ctrl+C для завершения.');
});

// app.listen(app.get('port'), function () {
// 	console.log('Express запущен на http://localhost:' + app.get('port') + '; нажмите Ctrl+C для завершения.');
// });
	
	
wss.on('connection', ws => {
	fs.watchFile(__dirname + '/data/data.json', (curr, prev) => {
		if (ws.readyState === ws.OPEN)
			ws.send("Изменён");
	});

});