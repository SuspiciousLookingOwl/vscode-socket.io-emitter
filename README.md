# socket-io-emitter README

`socket-io-emitter` is a simple Visual Studio Code Extension that allows you to connect to a Socket.io server and emits event to the server.

## Event listened on Visual Studio Code

This extension currently listens to the following Visual Studio Code event:

| VSCode Event  | Emited Event | Emited data |
| --- | --- | --- |
| `window.onDidChangeActiveTextEditor`  | `onDidChangeActiveTextEditor`  | `{ fileName, lineCount, fileSize, workspace }` 
| `workspace.onDidSaveTextDocument`  | `onDidSaveTextDocument`  | `{ fileName, lineCount, fileSize }` 


Need other events? [Submit a feature request issue](https://github.com/VincentJonathan/vscode-socket.io-emitter/issues/new/choose)

## Extension Commands

This extension contributes the following commands:

* `socket.connect`: Connect to Socket.io server
* `socket.disconnect`: Disconnect from Socket.io server
* `socket.reconnect`: Reconnect to Socket.io server
* `socket.setToken`: Set token value (emits Authenticate event on change)

## Extension Configurations

This extension contributes the following configurations:
* `socket.url`: Socket.io server url with port (e.g. http://example.com:3000 )
* `socket.autoConnect`: Define whether to auto connect to Socket.io server when VSCode is started
* `socket.authenticateEvent`: Event name that will be emitted after you connected to the Socket.io server (sends token)
* `socket.onDidChangeActiveTextEditor`: Event name that will be emitted when active text editor is changed (set to empty if you don't want to emit this event)
* `socket.onDidSaveTextDocument`: Event name that will be emitted when a file is saved (set to empty if you don't want to emit this event)

## Known Issues

\-