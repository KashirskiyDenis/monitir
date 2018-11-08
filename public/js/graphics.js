document.addEventListener('DOMContentLoaded', function () {
	let canvases = document.getElementsByTagName("canvas");
	let tables = document.getElementsByTagName("table");
	let buttons = document.getElementsByClassName("show_table");

	let ajax = (type, url) => {
		let promise = new Promise(function (resolve, reject) {
			let request = new XMLHttpRequest();

			request.open(type, url, true);

			request.send();

			request.onload = function () {
				if (this.status === 200) {
					resolve(this.response);
				} else {
					let error = new Error(this.statusText);
					error.code = this.status;
					reject(error);
				}
			};

			request.onerror = function () {
				reject(new Error("Network error"));
			};
		});

		return promise;
	};

	let graphics = {
		temperature: {},
		door: {},
		moveIn: {},
		moveOut: {},
		fire: {},
		crash: {},
		power: {}
	};

	let options = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		weekday: 'long',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric'
	};

	for (let canvas of canvases) {
		let tmp = canvas.dataset.typesensor.toLowerCase();
		graphics[tmp].ctx = canvas.getContext("2d");
		graphics[tmp].data = [];
		graphics[tmp].value = canvas.nextElementSibling;
		graphics[tmp].date = canvas.nextElementSibling.nextElementSibling;
	}

	for (let table of tables) {
		let tmp = table.dataset.typesensor.toLowerCase();
		graphics[tmp].table = table;
	}

	for (let button of buttons) {
		button.addEventListener("click", function () {
			this.innerHTML = this.innerHTML === "Показать в виде таблицы" ? "Скрыть таблицу" : "Показать в виде таблицы";
			this.nextElementSibling.classList.toggle("panel-active");
		});
	}	

	document.getElementById("day").addEventListener("click", getGraphics);
	document.getElementById("week").addEventListener("click", getGraphics);

	function getGraphics(e) {
		let day = 1;

		if (e.currentTarget.id === "week")
			day = 7;

		ajax("GET", "/sensor/5bc464b58524afc755903440/" + day).then(response => {
			response = JSON.parse(response);

			for (let key in graphics) {
				graphics[key].data = [];
				graphics[key].max = -Infinity;
				graphics[key].min = Infinity;
			}

			for (let i = 0; i < response.length; i++) {
				let tmp = response[i].type.toLowerCase();
				response[i].value = Number.parseFloat(response[i].value);
				graphics[tmp].data.push(response[i]);
				if (graphics[tmp].max < response[i].value) graphics[tmp].max = response[i].value;
				if (graphics[tmp].min > response[i].value) graphics[tmp].min = response[i].value;
			}

			for (let value in graphics) {
				if (graphics[value].ctx === undefined)
					continue;

				graphics[value].ctx.clearRect(0, 0, 800, 150);
				graphics[value].ctx.strokeStyle = "rgba(0, 0, 255, 1.0)";

				graphics[value].ctx.moveTo(0, 150 / 2);
				graphics[value].ctx.beginPath();

				let length = graphics[value].data.length;
				let tableInner = "<tr><th>Значение</th><th>Дата</th></tr>";

				let dateBegin = new Date(graphics[value].data[0].dateTime);
				let dateEnd = new Date(graphics[value].data[length - 1].dateTime);

				graphics[value].date.children[0].innerHTML = `${dateBegin.toLocaleString("ru", options)}`;
				graphics[value].date.children[1].innerHTML = `${dateEnd.toLocaleString("ru", options)}`;

				let max = graphics[value].max;
				let min = graphics[value].min;

				for (let i = 0; i < length; i++) {
					let x = i * (800 / length);
					let y = Number.parseFloat(graphics[value].data[i].value);
					let date = new Date(graphics[value].data[i].dateTime);
					tableInner += `<tr><td>${y}</td><td>${date}</td></tr>`;

					if (value === "temperature" || value === "power") {
						y = (0.125 + max - y) / (Math.abs(max) - Math.abs(min) + 0.25) * 150;
					} else {
						y = y === 1 ? 150 / 2 : 150;
					}

					graphics[value].ctx.lineTo(x, y);
				}

				graphics[value].ctx.stroke();
				graphics[value].table.innerHTML = tableInner;

				if (value === "temperature" || value === "power") {
					graphics[value].value.children[0].innerHTML = `Max: ${max} ${value === "temperature" ? "&#8451;" : "W"}`;
					graphics[value].value.children[1].innerHTML = `Min: ${min} ${value === "temperature" ? "&#8451;" : "W"}`;
				} else {
					graphics[value].value.children[0].innerHTML = `${value === "door" ? "Close" : "No movement"}`;
					graphics[value].value.children[1].innerHTML = `${value === "door" ? "Open" : "Movement"}`;
				}
			}
		}).catch(error => {
			alert(error);
		});
	}
});