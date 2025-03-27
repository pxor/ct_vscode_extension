import * as vscode from 'vscode';

let ctStarted = false;
let nextStepDisposable: vscode.Disposable | null = null;
let panel: vscode.WebviewPanel | null = null;

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
			if (panel) {
				panel.dispose();
				panel = null;
			}
		} else {
			// Start CT
			ctStarted = true;
			vscode.window.showInformationMessage('CodeTracer backend started!');

			// Show webview panel
			panel = vscode.window.createWebviewPanel(
				'codeTracer', // internal identifier
				'CodeTracer', // title shown to the user
				vscode.ViewColumn.Beside, // show beside editor
				{
					enableScripts: true,
				}
			);

			panel.webview.html = getWebviewContent();

			// Register nextStep command
			nextStepDisposable = vscode.commands.registerCommand('ct-vscode.nextStep', () => {
				vscode.window.showInformationMessage('Next clicked');
				if (panel) {
					panel.webview.postMessage({ command: 'next' });
				}
			});

			context.subscriptions.push(nextStepDisposable);
		}
	});

	context.subscriptions.push(toggleCT);
}

export function deactivate() {
	if (nextStepDisposable) nextStepDisposable.dispose();
	if (panel) panel.dispose();
}

function getWebviewContent(): string {
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<title>CodeTracer</title>
			<style>
				body { font-family: sans-serif; padding: 1em; }
			</style>
		</head>
		<body>
			<h1>Welcome to CodeTracer</h1>
			<p>This is the CodeTracer view. Click "Next" to proceed through steps.</p>
			<div id="log"></div>
			<script>
				const log = document.getElementById('log');
				window.addEventListener('message', event => {
					const message = event.data;
					if (message.command === 'next') {
						const entry = document.createElement('p');
						entry.textContent = 'Received "Next" step at ' + new Date().toLocaleTimeString();
						log.appendChild(entry);
					}
				});
			</script>
		</body>
		</html>
	`;
}