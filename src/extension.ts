import {commands, ExtensionContext} from "vscode";
import Logger from "./Logger";
import Client from "./Client";

let client = new Client();

export function activate(context: ExtensionContext) {

	// Register commands
	let connector = commands.registerCommand("socket.connect", () => {client.connect();});
	let disconnector = commands.registerCommand("socket.disconnect", () => {client.disconnect();});
	let reconnector = commands.registerCommand("socket.reconnect", () => {client.reconnect();});
	let tokenSetter = commands.registerCommand("socket.setToken", () => {client.setToken();});

	context.subscriptions.push(connector, disconnector, reconnector, tokenSetter);
}

export function deactivate() {
	client.disconnect();
}

process.on("unhandledRejection", (err) => Logger.log(err as string));