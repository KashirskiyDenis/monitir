var handlebars = require('express-handlebars')

function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

module.exports = function () {
	return handlebars.create({
		layoutsDir: "views/layouts/",
		partialsDir: "views/partials/",
		helpers: {
			sensor: function (data) {
				let str = "";
				for (let obj in data) {
					str += `<div class="accordion">${obj}</div>
						<div class="panel">
						<div class="flex-container">`;
					for (let sensor in data[obj]) {
						let string = data[obj][sensor].toString();
						if (string.includes("."))
							str += `<div class="green">${data[obj][sensor]}</div>`;
						else
							str += data[obj][sensor] === 1 ? `<div class="green">${sensor}</div>` : `<div class="red">${sensor}</div>`;

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