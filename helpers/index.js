var handlebars = require('express-handlebars')

function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

let sensors = {
	tmp: "Температура",
	door: "Открыта дверь",
	moveIn: "Датчик движения в контейнере",
	moveOut: "Датчик движения на улице",
	fire: "Пожар в помещении",
	crash: "Авария сети",
	power: "Мощность сети"
};

let sensorsValue = {
	door: ["Открыта", "Закрыта"],
	other: ["Нет", "Есть"],
};

module.exports = function () {
	return handlebars.create({
		layoutsDir: "views/layouts/",
		partialsDir: "views/partials/",
		helpers: {
			sensor: function (data) {
				let str = "";
				for (let obj in data) {
					str += `<div class="accordion">${obj}</div>
						<div class="panel panel-active">
						<div class="flex-container">`;
					for (let sensor in data[obj]) {
						str += `<div>
							<div>${ sensors[sensor]}</div>`;
						if (data[obj][sensor] === "1" || data[obj][sensor] === "0") {
							if (sensor === "door")
								str += data[obj][sensor] === "0" ? `<div class="red">${sensorsValue.door[0]}</div>` : `<div class="green">${sensorsValue.door[1]}</div>`;
							else
								str += data[obj][sensor] === "0" ? `<div class="green">${sensorsValue.other[0]}</div>` : `<div class="red">${sensorsValue.other[1]}</div>`;
						} else {
							str += `<div class="green">${data[obj][sensor]}</div>`;
						}
						str += `</div>`;
					}
					str += `</div>
						<div>
							<a href="/graphics/${obj}">Graphics</a>
						</div>
					</div>`;
				}
				return str;
			},
			testHelpers: function (data) {
				return `<div class="${Math.random() < 0.8 ? 'green' : 'red'}">${data}</div>`;
			},
			graphics: function (data) {
				let idObject = data.idObject;
				let array = data.data;
				let str = "";
				for (let element of array) {
					str += `<div class="graphic">
						<h2 class="graphic_title">${element}</h2>
						<canvas class="graphic_canvas" id="graphic_${element}" data-idObject="${idObject}" data-typeSensor="${element}" width="800" height="150"></canvas>
						<div class="graphic_value">
							<div>Max: 00.00</div>
							<div>Min: 00.00</div>
						</div>
						<div class="graphic_date">
							<div>Day of the week, DD month YYYY г., HH:MM:SS</div>
							<div>Day of the week, DD month YYYY г., HH:MM:SS</div>
						</div>
					</div>
					<div>
						<button class="show_table">Показать в виде таблицы</button>
						<table class="panel" id="table_${element}" data-typeSensor="${element}"></table>
					</div>`;
				}
				return str;
			}
		}
	});
}