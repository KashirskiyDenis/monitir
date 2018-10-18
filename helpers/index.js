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
					str += `</div></div>`;
				}
				return str;
			},
			testHelpers: function (data) {
				return `<div class="${Math.random() < 0.8 ? 'green' : 'red'}">${data}</div>`;
			}
		}
	});
}