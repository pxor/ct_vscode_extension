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
				
			// Show webview panel
			panel = vscode.window.createWebviewPanel(
				'codeTracer', // internal identifier
				'CodeTracer', // title shown to the user
				vscode.ViewColumn.Beside, // show beside editor
				{
					enableScripts: true,
				}
			);

			panel.webview.html = getWebviewContent(panel, context);

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

function getWebviewContent(panel: vscode.WebviewPanel, context: vscode.ExtensionContext): string {
	const scriptUri = panel.webview.asWebviewUri(
		vscode.Uri.joinPath(context.extensionUri, 'media', 'karax_frontend.js')
	);

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
			<div id="ROOT"></div>

			<script src="${scriptUri}"></script>
		</body>
		</html>
	`;
}
