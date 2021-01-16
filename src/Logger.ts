import { OutputChannel, window, workspace } from "vscode";

export default class Logger {
	private static _output: OutputChannel;

	private static _setup() {
		this._output = this._output || window.createOutputChannel("Socket.io Emitter");
	}

	public static log(message: string) {
		if (!this._output) {
			this._setup();
		}
		this._output.appendLine(message);
	}

	public static alert(message: string) {
		if (workspace.getConfiguration("socket").get<boolean>("silent")!) {
			return;
		}
		window.showInformationMessage(message);
	}
}
