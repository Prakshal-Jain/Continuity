from flask import Flask, render_template, request, send_from_directory
from flask_socketio import SocketIO, emit
from client_handle import ClientHandleNamespace
from random import randint
import logging

logging.basicConfig(filename="error.log")

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"
socketio = SocketIO(app, cors_allowed_origins="*")


@app.route("/extension_device_details")
def extension_device_details():
    return render_template("extension_device_details.html")


@app.route("/syncing_devices")
def syncing_devices():
    return render_template("syncing_devices.html")


@app.route("/")
def temp_website():
    return render_template("temp_website.html")

@app.route("/testing")
def index():
    return render_template("test.html", device_name="Dell_" + str(randint(0, 10)))


@app.route("/admin")
def admin():
    return render_template("admin.html")


@app.route("/assets/<path:path>")
def assets(path):
    return send_from_directory("assets", path)


@socketio.on_error_default
def error_handler(e):
    logging.exception(
        f"\n ============================================================ \n Exception occurred \n Event: {request.event['message']}\n Data: {request.event['args']} \n Error: \n"
    )
    data = open("error.log").read()
    print(data, flush=True)
    emit(
        request.event["message"],
        {
            "successful": False,
            "message": "Some internal error occured, please try again",
            "type": "error",
        },
    )


if __name__ == "__main__":
    socketio.on_namespace(ClientHandleNamespace("/api"))
    socketio.run(app, host="0.0.0.0", port="8000")
