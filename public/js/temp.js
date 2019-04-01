document.addEventListener('DOMContentLoaded', function () {
	let objects = document.getElementsByClassName("accordion");

	for (let i of objects) {
		i.addEventListener("click", function () {
			this.nextElementSibling.classList.toggle("panel-active");
		});
	}

	// let socket = new WebSocket("ws://213.80.162.30:3000");
	let socket = new WebSocket("ws://aortpc.ru:3000");

	let sensors = {
		temperature: "Температура",
		door: "Открыта дверь",
		moveIn: "Датчик движения в контейнере",
		moveOut: "Датчик движения на улице",
		fire: "Пожар в помещении",
		crash: "Авария сети",
		power: "Мощность сети"
	};

	let sensorsValue = {
		door: ["Закрыта", "Открыта"],
		other: ["Нет", "Есть"]
	};

	socket.onmessage = function (event) {
		var incomingMessage = JSON.parse(event.data);
		updateList(incomingMessage);
	};

	function updateList(data) {
		let str = "";
		let index = 0;

		for (let obj in data) {
			str += `<div class="flex-container">`;
			for (let sensor in data[obj]) {
				str += `<div>
				<div>${ sensors[sensor]}</div>`;
				if (data[obj][sensor] === "1" || data[obj][sensor] === "0") {
					if (sensor === "door")
						str += data[obj][sensor] === "0" ? `<div class="green">${sensorsValue.door[0]}</div>` : `<div class="red">${sensorsValue.door[1]}</div>`;
					else
						str += data[obj][sensor] === "0" ? `<div class="green">${sensorsValue.other[0]}</div>` : `<div class="red">${sensorsValue.other[1]}</div>`;
				} else {
					if (sensor === "power") {
						let tmp = data[obj][sensor];
						tmp = Number.parseFloat(tmp) * 330;
						tmp = Math.ceil(tmp * 100) / 100;
						str += `<div class="green">${tmp}</div>`;
					} else
						str += `<div class="green">${data[obj][sensor]}</div>`;
				}
				str += `</div>`;
			}
			str += `</div>
					<div>
						<a href="/graphics/${obj}">Графики</a>
					</div>
				</div>`;
			objects[index].nextElementSibling.innerHTML = str;
			str = "";
			index++;
		}
	}

});