import * as vscode from 'vscode';

export class BrowserProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'vs-chrome.view';
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri, 
        private readonly _context: vscode.ExtensionContext
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        const lastUrl = this._context.globalState.get<string>('lastUrl') || 'https://www.google.com';
        webviewView.webview.html = this._getHtml(lastUrl);

        webviewView.webview.onDidReceiveMessage(data => {
            if (data.type === 'urlChanged') {
                this._context.globalState.update('lastUrl', data.url);
            }
        });
    }

    public reload() {
        if (this._view) {
            const url = this._context.globalState.get<string>('lastUrl') || 'https://www.google.com';
            this._view.webview.html = this._getHtml(url);
        }
    }

    private _getHtml(url: string) {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <style>
                body { margin: 0; padding: 0; display: flex; flex-direction: column; height: 100vh; background: var(--vscode-editor-background); overflow: hidden; }
                .nav { display: flex; gap: 4px; padding: 6px; background: var(--vscode-sideBar-background); align-items: center; }
                input { flex: 1; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); padding: 4px 8px; border-radius: 4px; outline: none; font-size: 12px; }
                button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 4px 10px; border-radius: 2px; cursor: pointer; }
                .container { flex: 1; position: relative; }
                iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; background: white; }
            </style>
        </head>
        <body>
            <div class="nav">
                <input type="text" id="url" value="${url}" />
                <button onclick="navigate()">Go</button>
            </div>
            <div class="container">
                <iframe id="frame" src="${url}"></iframe>
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                const frame = document.getElementById('frame');
                const input = document.getElementById('url');
                function navigate() {
                    let val = input.value;
                    if (!val.includes('.') && !val.includes('://')) {
                        val = 'https://www.google.com/search?q=' + encodeURIComponent(val);
                    } else if (!val.startsWith('http')) {
                        val = 'https://' + val;
                    }
                    frame.src = val;
                    vscode.postMessage({ type: 'urlChanged', url: val });
                }
                input.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(); });
            </script>
        </body>
        </html>`;
    }
}