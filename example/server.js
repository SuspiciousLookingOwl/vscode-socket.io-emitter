const app = require("http").createServer(handler);
const io = require("socket.io")(app); // npm i socket.io

app.listen(3000);

function handler (req, res) {}

let currentFile = {};
let allowedSocket = null;
let isConnected = true;

io.on("connection", (socket) => {
	console.log(`${socket.id} connected`);

	// Send current active file to socket that's just connected
	socket.emit("activeFileChanged", currentFile);

	if(isConnected) {
		socket.emit("connected");
	}

	socket.on("authenticate", ({token}) => {
		// You can use other kind of token like JWT, but for this example, I'm just gonna match random string
		console.log("Authenticating : ", token);
		if(token === "sometoken") {
			isConnected = true;
			console.log(`${socket.id} authenticated`);
			// Set authenticated socket
			allowedSocket = socket.id;
			io.sockets.emit("connected");
		}
	});

	socket.on("activeFileChange", (file) => {
		// If socket isn't authenticated, dont do anything
		if(allowedSocket !== socket.id) {return;}

		// Set current file to the active file
		currentFile = file;
		// Emit current active file to other connected socket
		io.sockets.emit("activeFileChanged", file);
	});

	socket.on("fileSave", (files) => {
		// If socket isn't authenticated, dont do anything
		if(allowedSocket !== socket.id) {return;}

		// Emit saved files to other connected socket
		io.sockets.emit("fileSaved", files);
	});

	socket.on("disconnect", () => {
		console.log(`${socket.id} disconnected`);

		// If socket isn't authenticated, dont do anything
		if(allowedSocket !== socket.id) {return;}
    
		isConnected = false;
		// Emit to other connected socket that authenticated socket is disconnected
		io.sockets.emit("disconnected");
	});
});