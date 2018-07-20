var express = require('express');
var app = express();
var config = require('config');
var fs = require('fs');
var handlebars = require('helpers')();

var SerialPort = require('serialport');
var serialPort = new SerialPort('COM15');
var readLine = new SerialPort.parsers.Readline();

serialPort.pipe(readLine);

app.set('port', config.get('port'));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	let title = "Main page site";
	let data = JSON.parse(fs.readFileSync(__dirname + '/data/data.json', 'utf8'));
	res.render("temp", {
		objects: data,
		title: title,
		layout: 'main'
	});
});

app.use(function (req, res) {
	res.type('text/plain');
	res.status(404);
	res.send('404 — Не найдено');
});

app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.type('text/plain');
	res.status(500);
	res.send('500 — Ошибка сервера');
});

var http = require('http');
var server = http.createServer(app);
var WebSocket = require('ws');
var wss = new WebSocket.Server({ server });

server.listen(app.get('port'), function () {
	console.log('Express запущен на http://localhost:' + app.get('port') + '; нажмите Ctrl+C для завершения.');
});

// let data = fs.readFileSync(__dirname + '/data/data.txt', 'utf8');
// console.log(data.split(/\r\n/gm));

let data = fs.readFileSync(__dirname + '/data/data.json', 'utf8');

wss.on('connection', ws => {
	let json = JSON.parse(data);

	readLine.on('data', chunk => {
		json["obj1"]["sensor1"] = Number.parseInt(chunk);
		if (ws.readyState === ws.OPEN)
			ws.send(JSON.stringify(json));
	});
});