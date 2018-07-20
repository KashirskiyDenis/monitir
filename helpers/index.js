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
					str += `<div>${obj}</div>
						<div class="panel-active">
						<div class="flex-container">`;
					for (let sensor in data[obj])
						str += data[obj][sensor] === 1 ? `<div class="green">${sensor}</div>` : `<div class="red">${sensor}</div>`;
					str += `</div></div>`;
				}
				return str;
			}
		}
	});
}