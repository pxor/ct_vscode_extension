import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as os from 'os';
import * as utils from './utils';
import { create } from 'domain';

let backendProcess: ChildProcess | null = null;

let ctStarted = false;

let nextStepDisposable: vscode.Disposable | null = null;
let statePanel: vscode.WebviewPanel | null = null;
let calltracePanel: vscode.WebviewPanel | null = null;
let eventLogPanel: vscode.WebviewPanel | null = null;
let scratchpadPanel: vscode.WebviewPanel | null = null;
let terminalOutputPanel: vscode.WebviewPanel | null = null;

const TYPE_KIND_INT = 7

function intValue(i: number): any {
	return { kind: TYPE_KIND_INT, i: i.toString() }
}

function createComponentWebviewPanel(viewType: string, title: string): vscode.WebviewPanel {
	return vscode.window.createWebviewPanel(
		viewType,
		title,
		vscode.ViewColumn.Two,
		{
			enableScripts: true,
			retainContextWhenHidden: true
		}
	);
}
function disposePanels() {
	if (statePanel) {
		statePanel.dispose();
		statePanel = null;
	}

	if (calltracePanel) {
		calltracePanel.dispose();
		calltracePanel = null;
	}

	if (eventLogPanel) {
		eventLogPanel.dispose();
		eventLogPanel = null;
	}

	if (scratchpadPanel) {
		scratchpadPanel.dispose();
		scratchpadPanel = null;
	}

	if (terminalOutputPanel) {
		terminalOutputPanel.dispose();
		terminalOutputPanel = null;
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log('ct-vscode is now active!');

	const toggleCT = vscode.commands.registerCommand('ct-vscode.toggleCT', () => {
		if (ctStarted) {
			// Stop CT
			ctStarted = false;
			vscode.window.showInformationMessage('CodeTracer stopped.');

			if (nextStepDisposable) {
				nextStepDisposable.dispose();
				nextStepDisposable = null;
			}

			disposePanels();

			if (backendProcess) {
				backendProcess.kill();
				backendProcess = null;
			}
		} else {
			// Start CT
			ctStarted = true;
			vscode.window.showInformationMessage('CodeTracer backend started!');
			const callerPid = process.pid.toString();

			// Resolve trace paths
			const traceDir = path.join(os.homedir(), '.local', 'share', 'codetracer', 'trace-1');
			const traceFile = path.join(traceDir, 'trace.json');
			const metadataFile = path.join(traceDir, 'trace_metadata.json');

			// Adjust for your actual Rust binary path
			const backendPath = path.join(context.extensionPath, 'db-backend', 'db-backend');

			// backendProcess = spawn(backendPath, [callerPid, traceFile, metadataFile], {
			// 	cwd: context.extensionPath,
			// 	env: process.env,
			// 	stdio: 'pipe',
			// });

			// backendProcess.stdout?.on('data', data => {
			// 	console.log(`[backend stdout]: ${data.toString()}`);
			// });

			// backendProcess.stderr?.on('data', data => {
			// 	console.error(`[backend stderr]: ${data.toString()}`);
			// });

			// backendProcess.on('exit', code => {
			// 	console.warn(`Rust backend exited with code ${code}`);
			// 	vscode.window.showWarningMessage(`CodeTracer backend exited (${code})`);
			// });
			const editor = vscode.window.activeTextEditor;
			if (editor) {

				const document = editor.document;

				// Define a function to create decoration types with different labels
				function createDecoration(contentText: string, tooltip: string): [vscode.TextEditorDecorationType, vscode.DecorationOptions[]] {
					const decorationType = vscode.window.createTextEditorDecorationType({
						after: {
							contentText,
							backgroundColor: '#444',
							color: 'white',
							margin: '0 0 0 1em',
						},
					});

					const decorations: vscode.DecorationOptions[] = [];

					for (let line = 0; line < document.lineCount; line++) {
						const lineText = document.lineAt(line);
						const pos = new vscode.Position(line, lineText.text.length);

						decorations.push({
							range: new vscode.Range(pos, pos),
							hoverMessage: tooltip,
						});
					}

					return [decorationType, decorations];
				}

				// Create different types of decorations
				const [nextDecoration, nextDecorations] = createDecoration('▶ Next', 'Move to the next step');
				const [infoDecoration, infoDecorations] = createDecoration('ℹ Info', 'More info about this line');
				const [warnDecoration, warnDecorations] = createDecoration('⚠ Warn', 'Potential issue here');

				// Apply them all
				editor.setDecorations(nextDecoration, nextDecorations);
				editor.setDecorations(infoDecoration, infoDecorations);
				editor.setDecorations(warnDecoration, warnDecorations);
			}

			// Position webviewPanels:
			statePanel = createComponentWebviewPanel('stateComponent', 'State');
			calltracePanel = createComponentWebviewPanel('calltraceComponent', 'Calltrace');
			scratchpadPanel = createComponentWebviewPanel('scratchpadComponent', 'Scratchpad');
			eventLogPanel = createComponentWebviewPanel('eventLogComponent', 'Event Log');
			terminalOutputPanel = createComponentWebviewPanel('terminalOutputComponent', 'Terminal');

			statePanel.webview.html = utils.getStateWebviewContent(statePanel, context);
			calltracePanel.webview.html = utils.getCalltraceWebviewContent(calltracePanel, context);
			scratchpadPanel.webview.html = utils.getScratchpadWebviewContent(scratchpadPanel, context);
			eventLogPanel.webview.html = utils.getEventLogWebviewContent(eventLogPanel, context);
			terminalOutputPanel.webview.html = utils.getTerminalOutputWebviewContent(terminalOutputPanel, context);

			setTimeout(() => {
				terminalOutputPanel?.reveal();
				vscode.commands.executeCommand('workbench.action.moveEditorToBelowGroup');
				eventLogPanel?.reveal();
				vscode.commands.executeCommand('workbench.action.moveEditorToBelowGroup');
				vscode.commands.executeCommand('workbench.action.moveEditorLeftInGroup');
			}, 500);
			setTimeout(() => {
				calltracePanel?.reveal();
				vscode.commands.executeCommand('workbench.action.moveEditorToRightGroup');
			}, 500);
			statePanel.reveal(vscode.ViewColumn.Two)

			// Register nextStep command
			nextStepDisposable = vscode.commands.registerCommand('ct-vscode.nextStep', () => {
				vscode.window.showInformationMessage('Next clicked');
				if (statePanel) {
					statePanel.webview.postMessage({ command: 'next' });
					statePanel.webview.postMessage({ command: 'loaded-locals', values: [{ expression: "a", value: intValue(10) }] })
				}
			});

			context.subscriptions.push(nextStepDisposable);
		}
	});

	context.subscriptions.push(toggleCT);
}

export function deactivate() {
	if (nextStepDisposable) nextStepDisposable.dispose();
	if (statePanel) statePanel.dispose();
	if (calltracePanel) calltracePanel.dispose();
	if (eventLogPanel) eventLogPanel.dispose();
}
