var socket = new WebSocket("ws://localhost:3000");

// обработчик входящих сообщений
socket.onmessage = function (event) {
    var incomingMessage = event.data;
    alert(`Server answer: ${incomingMessage}`);
};