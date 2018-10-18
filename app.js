var express = require('express');
var config = require('config');
var fs = require('fs');
var handlebars = require('helpers')();
var MongoClient = require('mongodb').MongoClient;
var events = require('events');
var WebSocket = require('ws');

// var SerialPort = require('serialport');
// var serialPort = new SerialPort('COM15');
// var readLine = new SerialPort.parsers.Readline();

var app = express();
var state = JSON.parse(fs.readFileSync(__dirname + '/data/data.json', 'utf8'));

var getState = function (updateState) {
	let change = false;
	let id = updateState.id;

	// console.log(state);

	for (let prop in state[id]) {
		if (updateState[prop] && state[id][prop] != updateState[prop]) {
			change = true;
			state[id][prop] = updateState[prop];
		}
	}

	// console.log(state);

	if (change) {
		fs.writeFile(__dirname + '/data/data.json', JSON.stringify(state), (err) => {
			if (err) {
				console.log(err);
			}
		});
	}
};
// serialPort.pipe(readLine);

app.set('port', config.get('port'));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
	let title = "Main page site";
	res.render("temp", {
		objects: state,
		title: title,
		layout: 'main'
	});
});

app.get('/home', function (req, res) {
	let title = "Other page site";
	res.render("home", {
		objects: config.get('objects'),
		title: title,
		layout: 'main'
	});
});

var eventEmitter = new events.EventEmitter();

app.get('/eth', function (req, res) {
	let dateTime = new Date();

	getState(req.query);

	// state[objId]["tmp"] = Number.parseFloat(req.query.tmp);
	// state[objId]["door"] = Number.parseFloat(req.query.door);

	MongoClient.connect(config.get('mongodb'), { useNewUrlParser: true }, function (err, client) {

		var db = client.db('monitoring');

		let tmp = {
			idObject: req.query.id,
			type: "Temperature",
			value: req.query.tmp,
			dateTime: dateTime
		};

		let door = {
			idObject: req.query.id,
			type: "Door",
			value: req.query.door,
			dateTime: dateTime
		};

		db.collection('log').insertMany([tmp, door], function (err, result) {
			if (err) {
				console.log(err);
			}
			// console.log(result.ops);
			client.close();
		});
	});

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
var wss = new WebSocket.Server({ server });

server.listen(app.get('port'), function () {
	console.log('Express запущен на http://localhost:' + app.get('port') + '; нажмите Ctrl+C для завершения.');
});

var clients = {};

wss.on('connection', ws => {
	// let json = JSON.parse(data);

	// readLine.on('data', chunk => {
	// 	let dataCOM = JSON.parse(chunk);

	// 	json["obj1"]["sensor1"] = dataCOM["tmp"];
	// 	json["obj1"]["sensor2"] = dataCOM["door"];
	// 	if (ws.readyState === ws.OPEN)
	// 		ws.send(JSON.stringify(json));
	// });

	let idWS = Math.random();
	clients[idWS] = ws;

	eventEmitter.on('data', function () {
		for (let key in clients) {
			if (clients[key].readyState === clients[key].OPEN)
				clients[key].send(JSON.stringify(state));
		}
	});

	ws.on('close', function () {
		delete clients[idWS];
	});
});