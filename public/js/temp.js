document.addEventListener('DOMContentLoaded', function () {
	let objects = document.getElementsByClassName("accordion");

	for (let i of objects) {
		i.addEventListener("click", function () {
			this.classList.toggle("active");
			this.nextElementSibling.classList.toggle("panel-active");
		});
	}

	let socket = new WebSocket("ws://localhost:3000");

	socket.onmessage = function (event) {
		var incomingMessage = JSON.parse(event.data);
		updateList(incomingMessage);
	};

	function updateList(data) {
		let str = "";
		let index = 0;

		for (let obj in data) {
			str +=`<div class="flex-container">`;
			for (let sensor in data[obj]) {
				let string = data[obj][sensor].toString();
				if (string.includes("."))
					str += `<div class="green">${data[obj][sensor]}</div>`;
				else
					str += data[obj][sensor] === 1 ? `<div class="green">${sensor}</div>` : `<div class="red">${sensor}</div>`;

			}
			str += `</div>`;
			objects[index].nextElementSibling.innerHTML = str;
			str = "";
			index++;
		}
	}
});

