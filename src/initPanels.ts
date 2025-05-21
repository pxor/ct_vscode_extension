import * as vscode from 'vscode';
import { getOrCreatePanel } from './panelManager';
import * as utils from './utils';

export interface CodeTracerPanels {
    state: vscode.WebviewPanel;
    calltrace: vscode.WebviewPanel;
    scratchpad: vscode.WebviewPanel;
    eventLog: vscode.WebviewPanel;
    terminalOutput: vscode.WebviewPanel;
  }
  
  const panelMap: Partial<CodeTracerPanels> = {};

  export function initPanels(context: vscode.ExtensionContext): CodeTracerPanels {
    const state = panelMap.state = getOrCreatePanel(
      {
        id: 'stateComponent',
        title: 'State',
        getContent: utils.getStateWebviewContent
      },
      context
    );
  
    const calltrace = panelMap.calltrace = getOrCreatePanel(
      {
        id: 'calltraceComponent',
        title: 'Calltrace',
        getContent: utils.getCalltraceWebviewContent
      },
      context,
      (message, panel) => {
        const command = String.fromCharCode(...message.command);
        if (command === 'calltrace-jump') {
          console.log(message.callKey);
          panel.webview.postMessage({
            command: 'complete-call-move',
            callKey: message.callKey
          });
        }
      }
    );
  
    const scratchpad = panelMap.scratchpad = getOrCreatePanel(
      {
        id: 'scratchpadComponent',
        title: 'Scratchpad',
        getContent: utils.getScratchpadWebviewContent
      },
      context
    );
  
    const eventLog = panelMap.eventLog = getOrCreatePanel(
      {
        id: 'eventLogComponent',
        title: 'Event Log',
        getContent: utils.getEventLogWebviewContent
      },
      context
    );
  
    const terminalOutput = panelMap.terminalOutput = getOrCreatePanel(
      {
        id: 'terminalOutputComponent',
        title: 'Terminal',
        getContent: utils.getTerminalOutputWebviewContent
      },
      context
    );
  
    setTimeout(() => {
      terminalOutput.reveal();
      vscode.commands.executeCommand('workbench.action.moveEditorToBelowGroup');
      eventLog.reveal();
      vscode.commands.executeCommand('workbench.action.moveEditorToBelowGroup');
      vscode.commands.executeCommand('workbench.action.moveEditorLeftInGroup');
    }, 500);
  
    setTimeout(() => {
      calltrace.reveal();
      vscode.commands.executeCommand('workbench.action.moveEditorToRightGroup');
    }, 500);
  
    state.reveal(vscode.ViewColumn.Two);
  
    return panelMap as CodeTracerPanels;
  }

export function disposePanels() {
    Object.values(panelMap).forEach(panel => {
      if (panel) {
        panel.dispose();
      }
    });
  }
