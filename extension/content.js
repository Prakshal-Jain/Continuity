const socket = io.connect("https://continuitybrowser.com/api");

let buffer = [];

socket.on('connect', function () {
    console.log("connected user!")
    while (buffer.length > 0) {
        const m = buffer.pop();
        send_message(m);
    }
});

socket.on('disconnect', function () {
    console.log("User disconnected")
});

socket.on('update_tab', (data) => {
    console.log(data);
})


function send_message(message) {
    socket.emit(message.event_name, message.data);
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (socket.connected) {
        send_message(message);
    }
    else {
        buffer.push(message);
    }
})