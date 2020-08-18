import {window, workspace, TextDocument, Disposable} from "vscode";
import Logger from "./Logger";
import {basename} from "path";
import * as io from "socket.io-client";
import * as fs from "fs";
import * as path from "path";

const HOME_DIR = require("os").homedir();

interface EmittedTextDocument {
    fileName: string,
    lineCount: number,
    fileSize: number,
    workspace?: string
}


export default class Client {

    socketClient: SocketIOClient.Socket | null;
	config = workspace.getConfiguration("socket");
	disposable: Disposable[] = [];


	constructor() {
		Logger.log("Client created");

		this.socketClient = null;
		
    	workspace.onDidChangeConfiguration(() => {
    		this.config = workspace.getConfiguration("socket");
		});
		window.onDidChangeActiveTextEditor(() => { this.emitChangeActiveTextEditor(); });
		workspace.onDidSaveTextDocument((textDocument) => { this.emitSaveTextDocument(textDocument); });

		// Connect if autoconnect is enabled
		if(this.config.get<boolean>("autoConnect")){ 
			this.connect();
		}
	}


	/**
     * Connect to Socket.io server
     */
	connect() {
    	if(this.socketClient && this.socketClient.connected) {
    		Logger.log("Already connected to Socket.io server");
    		return;
		}
		
    	Logger.log(`Connecting to Socket.io server - ${this.config.get<string>("url")!}`);
		this.socketClient = io(this.config.get<string>("url")!);
		
		this.socketClient.on("connect", () => {
    		Logger.alert(`Connected to Socket.io server - ${this.config.get<string>("url")!}`);
			Logger.log(`Connected to Socket.io server - ${this.config.get<string>("url")!}`);
			this.emitAuthenticate();
			this.emitChangeActiveTextEditor();
		});
    	this.socketClient.on("reconnect", () => {
    		Logger.alert(`Reconnecting to ${this.config.get<string>("url")!}`);
    	    Logger.log(`Reconnecting to ${this.config.get<string>("url")!}`);
    	});
    	this.socketClient.on("disconnect", () => {
    		Logger.alert(`Disconnected from ${this.config.get<string>("url")!}`);
    	    Logger.log(`Disconnected from ${this.config.get<string>("url")!}`);
    	});

	}


	/**
     * Disconnect from Socket.io server
     */
	disconnect() {
    	if(this.socketClient && this.socketClient.connected) {
			Logger.log("Disconnecting from Socket.io server");
			this.socketClient.removeAllListeners();
    		this.socketClient.disconnect();
    	} else {
    		Logger.log("You are not connected to a Socket.io server");
    	}
	}
 
    
	/**
     * Reconnect to Socket.io server
     */
	reconnect() {
    	this.disconnect();
    	this.connect();
	}
	
	/**
	 * Prompt input box for token`
	 */
	async promptTokenInput() {
		let token = await window.showInputBox({
			placeHolder: "Token",
			password: true,
			prompt: "Enter your token (Emits authenticate event)"
		});
		if (token !== undefined) {
			this.setToken(token);
			this.emitAuthenticate();
		}
	}

	setToken(token: string) {
		fs.writeFileSync(path.join(HOME_DIR, ".socket.io.emitter.json"), JSON.stringify({token}));
	}

	getToken(): string {
		try {
			let config = JSON.parse(fs.readFileSync(path.join(HOME_DIR, ".socket.io.emitter.json"), "utf-8"));
			return config.token || "";
		} catch(err) {
			return "";
		}
	}
 	
	/**
	 * Emit authenticate event to Socket.IO server
	 */
	emitAuthenticate() {
		if(!this.socketClient || !this.socketClient.connected) {return;}
		
		const eventName = this.config.get<string>("authenticateEvent")!;
		if(!eventName) {return;}
		
    	Logger.log(`Emitting ${eventName}`);
		this.socketClient!.emit(eventName, {token: this.getToken()});
	}
 

	/**
     * Handler for window.onDidChangeActiveTextEditor event
     */
	async emitChangeActiveTextEditor() {
    	if(!this.socketClient || !this.socketClient.connected) {return;}
        
    	const eventName = this.config.get<string>("onDidChangeActiveTextEditor")!;
    	if(!eventName) {return;}
        
    	let data = {} as EmittedTextDocument;

    	if (window.activeTextEditor) {
    		let size = 0;
    		try {
    			size = (await workspace.fs.stat(window.activeTextEditor.document.uri)).size;
    		} catch (err){
    			return; // Not a file
    		}
    		data = {
    			fileName: basename(window.activeTextEditor.document.fileName),
    			lineCount: window.activeTextEditor.document.lineCount,
    			fileSize: size,
    			workspace: workspace.name,
    		};
    	}
        
    	Logger.log(`Emitting ${eventName}`);
    	this.socketClient.emit(eventName, data);
	}


	/**
     * Handler for workspace.onDidSaveTextDocument event
     */
	async emitSaveTextDocument(savedFile: TextDocument ) {
    	if(!this.socketClient || !this.socketClient.connected) {return;}
        
    	const eventName = this.config.get<string>("onDidSaveTextDocument")!;
    	if(!eventName) {return;}
        
    	savedFile.fileName;

    	let data = {} as EmittedTextDocument;
        
    	if (window.activeTextEditor) {
    		let size = 0;
    		try {
    			size = (await workspace.fs.stat(savedFile.uri)).size;
    		} catch (err){
    			return; // Not a file
    		}
    		data = {
    			fileName: basename(savedFile.fileName),
    			lineCount: savedFile.lineCount,
    			fileSize: size
    		};
    	}
        
    	Logger.log(`Emitting ${eventName}`);
    	this.socketClient.emit(this.config.get<string>("onDidSaveTextDocument")!, data);
	};

}