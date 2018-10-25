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

	for (let canvas of canvases) {
		let tmp = canvas.dataset.typesensor.toLowerCase();
		graphics[tmp].ctx = canvas.getContext("2d");
		graphics[tmp].data = [];
	}

	for (let table of tables) {
		let tmp = table.dataset.typesensor.toLowerCase();
		graphics[tmp].table = table;
	}

	document.getElementById("day").addEventListener("click", getGraphics);
	document.getElementById("week").addEventListener("click", getGraphics);

	function getGraphics(e) {
		let day = 1;

		if (e.currentTarget.id === "week")
			day = 7;

		ajax("GET", "/sensor/5bc464b58524afc755903440/" + day).then(response => {
			response = JSON.parse(response);

			for (let key in graphics)
				graphics[key].data = [];

			for (let i = 0; i < response.length; i++) {
				let tmp = response[i].type.toLowerCase();
				response[i].value = Number.parseFloat(response[i].value);
				graphics[tmp].data.push(response[i]);
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

				for (let i = 0; i < length; i++) {
					let x = i * (800 / length);
					let y = Number.parseFloat(graphics[value].data[i].value);
					let date = new Date(graphics[value].data[i].dateTime);

					tableInner += `<tr><td>${y}</td><td>${date}</td></tr>`;

					if (value === "temperature" || value === "power") {
						let max = -Infinity;
						let min = Infinity;
						for (let j = 0; j < length; j++) {
							let tmp = graphics[value].data[j].value;
							if (max < tmp) max = tmp;
							if (min > tmp) min = tmp;
						}
						graphics[value].ctx.font = "15px Arial";
						graphics[value].ctx.fillText("Max: " + max, 700, 20);
						graphics[value].ctx.fillText("Min: " + min, 700, 50);
						y = y * 150 / 2 / max;
					} else {
						y = y === 1 ? 150 / 2 : 150;
						graphics[value].ctx.font = "15px Arial";
						graphics[value].ctx.fillText("Close", 750, 60);
						graphics[value].ctx.fillText("Open", 750, 145);
					}

					graphics[value].ctx.lineTo(x, y);
				}
				graphics[value].ctx.stroke();
				graphics[value].table.innerHTML = tableInner;
			}
		}).catch(error => {
			alert(error);
		});
	}

	(function () {
		for (let button of buttons) {
			button.addEventListener("click", function () {
				// this.classList.toggle("active");
				this.innerHTML = this.innerHTML === "Показать таблицу" ? "Скрыть таблицу" : "Показать таблицу";
				this.nextElementSibling.classList.toggle("panel-active");
			});
		}
	})();

});