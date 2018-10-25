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

	for (let prop in state[id]) {
		if (updateState[prop] && state[id][prop] != updateState[prop]) {
			change = true;
			state[id][prop] = updateState[prop];
		}
	}

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

eventEmitter.on('data', function () {
	for (let key in clients) {
		if (clients[key].readyState === clients[key].OPEN)
			clients[key].send(JSON.stringify(state));
	}
});

app.get('/eth', function (req, res) {
	let dateTime = Date.now();

	getState(req.query);

	MongoClient.connect(config.get('mongodb'), { useNewUrlParser: true }, function (err, client) {

		let db = client.db('monitoring');

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
			console.log(result.ops);
			client.close();
		});
	});

	eventEmitter.emit('data');
});

app.get('/graphics/:idObject', function (req, res) {
	let title = "Graphics - " + req.params.idObject;

	MongoClient.connect(config.get('mongodb'), { useNewUrlParser: true }, function (err, client) {
		let db = client.db('monitoring');
		let result = db.collection('log').distinct("type", { idObject: req.params.idObject });

		result.then(data => {
			res.render("graphics", {
				data: { data: data, idObject: req.params.idObject },
				idObject: req.params.idObject,
				title: title,
				layout: 'main'
			});
			client.close();
		}).catch(err => {
			console.log(err);
		});
	});
});

app.get('/sensor/:idObject/:period', function (req, res) {
	let time = Number.parseFloat(req.params.period);
	let period = Date.now() - time * 24 * 60 * 60 * 1000;

	MongoClient.connect(config.get('mongodb'), { useNewUrlParser: true }, function (err, client) {
		let db = client.db('monitoring');
		let result = db.collection('log').find({
			idObject: req.params.idObject,
			dateTime: { $gte: period }
		});
		result.toArray().then(array => {
			res.json(array);
		}).catch(err => {
			console.log(err);
		});
	});
});

app.use(function (req, res) {
	res.type('text/plain');
	res.status(404);
	res.send('404 — Страница не найдена');
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

	ws.on('close', function () {
		delete clients[idWS];
	});
});