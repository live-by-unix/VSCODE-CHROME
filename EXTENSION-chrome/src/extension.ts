import * as vscode from 'vscode';
import { BrowserProvider } from './BrowserProvider';

export function activate(context: vscode.ExtensionContext) {
    const provider = new BrowserProvider(context.extensionUri, context);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            BrowserProvider.viewType, 
            provider,
            { webviewOptions: { retainContextWhenHidden: true } }
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('vs-chrome.refresh', () => {
            provider.reload();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('vs-chrome.clearHistory', () => {
            context.globalState.update('lastUrl', undefined);
            provider.reload();
            vscode.window.showInformationMessage('History Cleared');
        })
    );
}

export function deactivate() {}