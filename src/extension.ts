import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as os from 'os';

let backendProcess: ChildProcess | null = null;

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
			
			backendProcess = spawn(backendPath, [callerPid, traceFile, metadataFile], {
				cwd: context.extensionPath,
				env: process.env,
				stdio: 'pipe',
			});
			
			backendProcess.stdout?.on('data', data => {
				console.log(`[backend stdout]: ${data.toString()}`);
			});
			
			backendProcess.stderr?.on('data', data => {
				console.error(`[backend stderr]: ${data.toString()}`);
			});
			
			backendProcess.on('exit', code => {
				console.warn(`Rust backend exited with code ${code}`);
				vscode.window.showWarningMessage(`CodeTracer backend exited (${code})`);
			});
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

			console.log(panel)
			console.log(panel.webview)

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
	const uiJs = panel.webview.asWebviewUri(
		vscode.Uri.joinPath(context.extensionUri, 'media', 'ui.js')
	);
	const frontendBundle = panel.webview.asWebviewUri(
		vscode.Uri.joinPath(context.extensionUri, 'media', 'frontend_bundle.js')
	);
	const thirdParty = panel.webview.asWebviewUri(
		vscode.Uri.joinPath(context.extensionUri, 'media', 'third_party' , 'jstree.min.js')
	);

	return `
		<!doctype html>
		<html>
			<head>
				<meta charset='utf-8'>
				<title>CodeTracer</title>
			<script>
				inElectron = false
				loadScripts = true
			</script>
			</head>
			<body>
				<div id='menu' class='menu'>
				</div>
				<div id='welcomeScreen'>

				</div>
				<div id='root-container' class='container'>
				<div id='ROOT'>
					<div id="context-menu-container" style="display: none;"></div>
					<div id='fixed-search'>
					</div>
					<section id="main">
					</section>
				</div>


				<footer>
					<div id='search-results'>
					</div>
					<div id='status'>
					</div>
				</footer>
				</div>
				<script src="${frontendBundle}" type="text/javascript"> </script>
				<script src='${thirdParty}' type='text/javascript'></script>
				<script src='${uiJs}'></script>

			</body>
		</html>

	`;
}
