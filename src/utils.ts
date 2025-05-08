import * as vscode from 'vscode';

function getUiJs(panel: vscode.WebviewPanel, context: vscode.ExtensionContext): vscode.Uri {
    return panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'media', 'ui.js')
    );
}

function getFrontendBundle(panel: vscode.WebviewPanel, context: vscode.ExtensionContext): vscode.Uri {
    return panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'media', 'frontend_bundle.js')
    );
}

function getThirdParty(panel: vscode.WebviewPanel, context: vscode.ExtensionContext): vscode.Uri {
    return panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'media', 'third_party', 'jstree.min.js')
    );
}

function getDarkTheme(panel: vscode.WebviewPanel, context: vscode.ExtensionContext): vscode.Uri {
    return panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, 'media', 'styles', 'default_dark_theme.css')
    );
}

export function getStateWebviewContent(panel: vscode.WebviewPanel, context: vscode.ExtensionContext): string {
    let uiJs = getUiJs(panel, context);
    let frontendBundle = getFrontendBundle(panel, context);
	let thirdParty =  getThirdParty(panel, context);
    let defaultDarkTheme = getDarkTheme(panel, context);

    // TODO: Add .css file to webViewContent

    return `
		<!doctype html>
		<html>
			<head>
				<meta charset='utf-8'>
				<title>CodeTracer</title>
				<link id='theme' rel='stylesheet' href='${defaultDarkTheme}'>
			<script>
				inElectron = false
				loadScripts = true
			</script>
			</head>
			<body>
				<div>STATE</div>
				<div id='stateComponent-0' class='component-container active-state'></div>

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
				<script>
					let component = null
					window.addEventListener('DOMContentLoaded', () => {
						window.component = makeStateComponentForExtension('stateComponent-0');
					});
					window.addEventListener('message', event => {
						if (event.data.command === 'loaded-locals') {
								registerLocals(window.component, event.data.values)
							}
					});
				</script>
			</body>
		</html>

	`;
}

export function getCalltraceWebviewContent(panel: vscode.WebviewPanel, context: vscode.ExtensionContext): string {
    let uiJs = getUiJs(panel, context);
    let frontendBundle = getFrontendBundle(panel, context);
	let thirdParty =  getThirdParty(panel, context);
    let defaultDarkTheme = getDarkTheme(panel, context);

    // TODO: Add .css file to webViewContent

    return `
		<!doctype html>
		<html>
			<head>
				<meta charset='utf-8'>
				<title>CodeTracer</title>
				<link id='theme' rel='stylesheet' href='${defaultDarkTheme}'>
			<script>
				inElectron = false
				loadScripts = true
			</script>
			</head>
			<body>
				<div>CALLTRACE</div>
				<div id='calltraceComponent-0' class='component-container active-state'></div>

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
				<script>
					let component = null
					window.addEventListener('DOMContentLoaded', () => {
						window.component = makeCalltraceComponentForExtension('calltraceComponent-0');
					});
				</script>
			</body>
		</html>
	`;
}

export function getEventLogWebviewContent(panel: vscode.WebviewPanel, context: vscode.ExtensionContext): string {
    let uiJs = getUiJs(panel, context);
    let frontendBundle = getFrontendBundle(panel, context);
	let thirdParty =  getThirdParty(panel, context);
    let defaultDarkTheme = getDarkTheme(panel, context);

    // TODO: Add .css file to webViewContent

    return `
		<!doctype html>
		<html>
			<head>
				<meta charset='utf-8'>
				<title>CodeTracer</title>
				<link id='theme' rel='stylesheet' href='${defaultDarkTheme}'>
			<script>
				inElectron = false
				loadScripts = true
			</script>
			</head>
			<body>
				<div>EVENT LOG</div>
				<div id='eventLogComponent-0' class='component-container active-state'></div>

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
				<script>
					let component = null
					window.addEventListener('DOMContentLoaded', () => {
						window.component = makeEventLogComponentForExtension('eventLogComponent-0');
					});
				</script>
			</body>
		</html>
	`;
}

export function getScratchpadWebviewContent(panel: vscode.WebviewPanel, context: vscode.ExtensionContext): string {
    let uiJs = getUiJs(panel, context);
    let frontendBundle = getFrontendBundle(panel, context);
	let thirdParty =  getThirdParty(panel, context);
    let defaultDarkTheme = getDarkTheme(panel, context);

    // TODO: Add .css file to webViewContent

    return `
		<!doctype html>
		<html>
			<head>
				<meta charset='utf-8'>
				<title>CodeTracer</title>
				<link id='theme' rel='stylesheet' href='${defaultDarkTheme}'>
			<script>
				inElectron = false
				loadScripts = true
			</script>
			</head>
			<body>
				<div>SCRATCHPAD</div>
				<div id='scratchpadComponent-0' class='component-container active-state'></div>

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
				<script>
					let component = null
					window.addEventListener('DOMContentLoaded', () => {
						window.component = makeScratchpadComponentForExtension('scratchpadComponent-0');
					});
				</script>
			</body>
		</html>
	`;
}

export function getTerminalOutputWebviewContent(panel: vscode.WebviewPanel, context: vscode.ExtensionContext): string {
    let uiJs = getUiJs(panel, context);
    let frontendBundle = getFrontendBundle(panel, context);
	let thirdParty =  getThirdParty(panel, context);
    let defaultDarkTheme = getDarkTheme(panel, context);

    // TODO: Add .css file to webViewContent

    return `
		<!doctype html>
		<html>
			<head>
				<meta charset='utf-8'>
				<title>CodeTracer</title>
				<link id='theme' rel='stylesheet' href='${defaultDarkTheme}'>
			<script>
				inElectron = false
				loadScripts = true
			</script>
			</head>
			<body>
				<div>TERMINAL</div>
				<div id='terminalOutputComponent-0' class='component-container active-state'></div>

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
				<script>
					let component = null
					window.addEventListener('DOMContentLoaded', () => {
						window.component = makeTerminalOutputComponentForExtension('terminalOutputComponent-0');
					});
				</script>
			</body>
		</html>
	`;
}
