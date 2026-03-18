/**
 * Webview panel showing Chart.js pie chart of commits per author.
 * Uses JSON.stringify for labels to prevent XSS from commit metadata.
 */
import * as vscode from 'vscode';
import * as path from 'path';
import Constants from '../../utils/constants';

export default class CommitsPanel {
  public static currentPanel: CommitsPanel | undefined;

  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(comitsPerAuthor: any, config: any, context:vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
    if (CommitsPanel.currentPanel) {
      CommitsPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel("CommitsPanel", "CommitsPerAuthor", column || vscode.ViewColumn.One,
      {
        enableScripts: true
      }
    );

    const ChartJSFilePath = vscode.Uri.file(
      path.join(context.extensionPath, 'resources', 'chart.umd.min.js'),
    );
    const chartJssrc = panel.webview.asWebviewUri(ChartJSFilePath);
    CommitsPanel.currentPanel = new CommitsPanel(panel, comitsPerAuthor, config, chartJssrc);
  }

  private constructor(panel: vscode.WebviewPanel, comitsPerAuthor:any, config:any, chartJssrc: vscode.Uri) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel = panel;
    const webViewContent = this.getWebviewContent(comitsPerAuthor, config, chartJssrc);
    this._panel.webview.html = webViewContent;
  }

  private getWebviewContent(comitsPerAuthor: any | [], config: any, chartJssrc: vscode.Uri) {
    const totalCommits = comitsPerAuthor
      .map((c: any) => parseInt(c.totalCommits, 10) || 0)
      .reduce((t: number, n: number) => t + n, 0);
    const labels = comitsPerAuthor.map((commit: any) => {
      const pct = totalCommits > 0
        ? ((parseInt(commit.totalCommits, 10) || 0) * 100 / totalCommits).toFixed(2) + '%'
        : '0%';
      return JSON.stringify(`${commit.author ?? ''} (${commit.totalCommits ?? 0}) ${pct}`);
    });
    const labelsJson = `[${labels.join(',')}]`;
    const data = JSON.stringify(comitsPerAuthor.map((c: any) => parseInt(c.totalCommits, 10) || 0));
    const bodyStyle = (config.width > 0 && config.height >0) ? `body { width:  ${config.width}px; height: ${config.width}px}` : '';
    return `<!DOCTYPE html>
          <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Signin</title>
            </head>
            <body>
              <canvas id="myChart"></canvas>
              <script src="${chartJssrc}"></script>
              <script>
                const vscode = acquireVsCodeApi();
                (function init() {
                  document.vscode = vscode;
                })();
              </script>
              <script>
                var ctx = document.getElementById('myChart');
                var chart = new Chart(ctx, {
                  type: 'pie',
                  data: {
                    labels: ${labelsJson},
                    datasets: [{
                        data: ${data},
                        borderWidth: 2,
                        backgroundColor: ${Constants.colors}
                    }]
                  },
                  options: {
                    maintainAspectRatio: true,
                    backgroundColor: '#c1c1c1',
                    responsive: true,
                    legend: {
                      display: ${config.showLegend},
                      position: '${config.legendPosition}',
                    }
                  }
                });
              </script>
            </body>
            <style>
              ${bodyStyle}
              body.vscode-light .username, body.vscode-light .password {
                color: #616466;
              }
              body.vscode-dark .username, body.vscode-dark .password {
                color: #C2C7CC;
              }
            </style>
          </html>`;
  }

    public dispose() {
      CommitsPanel.currentPanel = undefined;
      // Clean up our resources
      this._panel.dispose();

      while (this._disposables.length) {
        const panel = this._disposables.pop();
        if (panel) {
          panel.dispose();
        }
      }
    }
}