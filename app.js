var express = require('express');
var app = express();
var config = require('config');
var fs = require('fs');
var handlebars = require('helpers')();

var SerialPort = require('serialport');
// var serialPort = new SerialPort('COM15');
// var readLine = new SerialPort.parsers.Readline();

var events = require('events');
var eventEmitter = new events.EventEmitter();

var state = fs.readFileSync(__dirname + '/data/data.json', 'utf8');

// serialPort.pipe(readLine);

app.set('port', config.get('port'));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	let title = "Main page site";
	// let data = JSON.parse(fs.readFileSync(__dirname + '/data/data.json', 'utf8'));
	res.render("temp", {
		objects: state,
		title: title,
		layout: 'main'
	});
});

// app.get('/home', function (req, res) {
// 	let title = "Other page site";
// 	res.render("home", {
// 		objects: config.get('objects'),
// 		title: title,
// 		layout: 'main'
// 	});
// });

app.get('/eth', function (req, res) {

	state["obj1"]["sensor1"] = Number.parseFloat(req.query.tmp);
	state["obj1"]["sensor2"] = Number.parseFloat(req.query.door);

	eventEmitter.emit('data');
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

wss.on('connection', ws => {
	// let json = JSON.parse(data);

	// readLine.on('data', chunk => {
	// 	let dataCOM = JSON.parse(chunk);

	// 	json["obj1"]["sensor1"] = dataCOM["tmp"];
	// 	json["obj1"]["sensor2"] = dataCOM["door"];
	// 	if (ws.readyState === ws.OPEN)
	// 		ws.send(JSON.stringify(json));
	// });

	eventEmitter.on('data', function() {
		if (ws.readyState === ws.OPEN)
			ws.send(JSON.stringify(state));
	});
});