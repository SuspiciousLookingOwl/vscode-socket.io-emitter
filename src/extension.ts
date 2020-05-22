import {commands, ExtensionContext, workspace} from "vscode";
import Logger from "./Logger";
import SocketClient from "./SocketClient";

let client = new SocketClient();

const config = workspace.getConfiguration("socket");

// Connect if autoconnect is enabled
if(config.get<boolean>("autoConnect")){ 
	client.connect();
}

export function activate(context: ExtensionContext) {

	// Register commands
	let connector = commands.registerCommand("socket.connect", () => {client.connect();});
	let disconnector = commands.registerCommand("socket.disconnect", () => {client.disconnect();});
	let reconnector = commands.registerCommand("socket.reconnect", () => {client.reconnect();});

	context.subscriptions.push(connector, disconnector, reconnector);
}

export function deactivate() {
	client.disconnect();
}

process.on("unhandledRejection", (err) => Logger.log(err as string));