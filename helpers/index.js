var handlebars = require('express-handlebars')

function getRandomArbitrary(min, max) {	
	return Math.random() * (max - min) + min;
}

module.exports = function() {
	return handlebars.create({
		// defaultLayout: 'main',
		layoutsDir: "views/layouts/",
		partialsDir: "views/partials/",
		helpers: {
			testHelpres: function (str) {
				if (Math.random() < 0.25) {
					return `<div class="red">${str}</div>`;
					} else {
					return `<div class="green">${str}</div>`;
				}	
			}
		}
	});
}

