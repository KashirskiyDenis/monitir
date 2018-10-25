document.addEventListener('DOMContentLoaded', function () {
	let objects = document.getElementsByClassName("accordion");

	for (let i of objects) {
		i.addEventListener("click", function () {
			this.classList.toggle("active");
			this.nextElementSibling.classList.toggle("panel-active");
		});
	}
});