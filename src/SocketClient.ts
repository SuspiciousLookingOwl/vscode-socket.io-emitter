import {window, workspace, TextDocument} from "vscode";
import Logger from "./Logger";
import {basename} from "path";
import * as io from "socket.io-client";


interface EmittedTextDocument {
    fileName: string,
    lineCount: number,
    fileSize: number,
    workspace?: string
}


export default class SocketClient {

    client: SocketIOClient.Socket | null;
    config = workspace.getConfiguration("socket");


    constructor() {
    	Logger.log("Socket Client created");
    	this.client = io();
		
    	workspace.onDidChangeConfiguration(() => {
    		this.config = workspace.getConfiguration("socket");
    	});
		
    }


    /**
     * Connect to Socket.io server
     */
    async connect() {
    	if(this.client && this.client.connected) {
    		Logger.log("Already connected to Socket.io server");
    		return;
    	}
        
    	Logger.log("Connecting to Socket.io server");
        
    	this.client = io(this.config.get<string>("url")!);

    	this.client.on("connect", () => {
    		window.showInformationMessage(`Connected to Socket.io server - ${this.config.get<string>("url")!}`);
    		Logger.log(`Connected to Socket.io server - ${this.config.get<string>("url")!}`);
            
    		this.client!.emit(this.config.get<string>("authenticateEvent")!, {token: this.config.get<string>("token")!});
    		this.emitChangeActiveTextEditor();
            
    		window.onDidChangeActiveTextEditor(() => { this.emitChangeActiveTextEditor(); });
    		workspace.onDidSaveTextDocument((textDocument) => { this.emitSaveTextDocument(textDocument); });
    	});
    	this.client.on("reconnect", () => {
    		window.showInformationMessage(`Reconnecting to ${this.config.get<string>("url")!}`);
    	    Logger.log(`Reconnecting to ${this.config.get<string>("url")!}`);
    	});
    	this.client.on("disconnect", () => {
    		window.showInformationMessage(`Disconnected from ${this.config.get<string>("url")!}`);
    	    Logger.log(`Reconnecting to ${this.config.get<string>("url")!}`);
    	});
    }


    /**
     * Disconnect from Socket.io server
     */
    disconnect() {
    	if(this.client && this.client.connected) {
    		Logger.log("Disconnecting from Socket.io server");
    		this.client.disconnect();
    		this.client = null;
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
     * Handler for window.onDidChangeActiveTextEditor event
     */
    async emitChangeActiveTextEditor() {
    	if(!this.client || !this.client.connected) {return;}
        
    	const eventName = this.config.get<string>("onDidChangeActiveTextEditor")!;
    	if(!eventName) {return;}
        
    	let data = {} as EmittedTextDocument;

    	if (window.activeTextEditor) {
    		let size = 0;
    		try {
    			size = await (await workspace.fs.stat(window.activeTextEditor.document.uri)).size;
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
    	this.client.emit(eventName, data);
    }


    /**
     * Handler for workspace.onDidSaveTextDocument event
     */
    async emitSaveTextDocument(savedFile: TextDocument ) {
    	if(!this.client || !this.client.connected) {return;}
        
    	const eventName = this.config.get<string>("onDidSaveTextDocument")!;
    	if(!eventName) {return;}
        
    	savedFile.fileName;

    	let data = {} as EmittedTextDocument;
        
    	if (window.activeTextEditor) {
    		let size = 0;
    		try {
    			size = await (await workspace.fs.stat(savedFile.uri)).size;
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
    	this.client.emit(this.config.get<string>("onDidSaveTextDocument")!, data);
    };

}