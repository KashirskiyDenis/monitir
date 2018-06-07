let socket = new WebSocket("ws://localhost:3000");
let list = document.getElementById("list_objects");

socket.onmessage = function (event) {
    var incomingMessage = JSON.parse(event.data);
    updateList(incomingMessage);
};

function updateList(data) {
    let str = "";
    for (let obj in data) {
        str += `<div>${obj}</div>
        <div class="panel-active">
        <div class="flex-container">`;
        for (let sensor in data[obj])
            str += data[obj][sensor] === 1 ? `<div class="green">${sensor}</div>` : `<div class="red">${sensor}</div>`;
        str += `</div></div>`;
    }

    list.innerHTML = str;
}