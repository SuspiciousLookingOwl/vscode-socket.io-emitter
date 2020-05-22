# socket.io-emitter README

`socket.io-emitter` is a simple Visual Studio Code Extension that allows you to connect to a Socket.io server and emits event to the server.

## Event listened on Visual Studio Code

This extension currently listens to the following Visual Studio Code event:
- `window.onDidChangeActiveTextEditor`
- `workspace.onDidSaveTextDocument`

Need other events? [Submit a feature request issue](https://github.com/VincentJonathan/vscode-socket.io-emitter/issues/new?assignees=&labels=&template=feature_request.md&title=%5BENHANCEMENT%5D)

## Extension Commands

This extension contributes the following commands:

* `socket.connect`: Connect to Socket.io server
* `socket.disconnect`: Disconnect from Socket.io server
* `socket.reconnect`: Reconnect to Socket.io server

## Extension Configurations

This extension contributes the following configurations:
* `socket.url`: Socket.io server url with port (e.g. http://example.com:3000 )
* `socket.autoConnect`: Define whether to auto connect to Socket.io server when VSCode is started
* `socket.token`: (Optional) Token string value that will be sent when authenticating
* `socket.authenticateEvent`: Event name that will be emitted after you connected to the Socket.io server (sends token)
* `socket.onDidChangeActiveTextEditor`: Event name that will be emitted when active text editor is changed (set to empty if you don't want to emit this event)
* `socket.onDidSaveTextDocument`: Event name that will be emitted when a file is saved (set to empty if you don't want to emit this event)

## Known Issues

\-