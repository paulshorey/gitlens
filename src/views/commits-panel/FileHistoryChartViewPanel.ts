/**
 * Webview panel showing Chart.js bubble chart of file commit history.
 * Escapes user data (author, message) via JSON.stringify to prevent XSS.
 */
/* eslint-disable import/no-default-export */
'use strict';
import * as path from 'path';
import { commands, ConfigurationChangeEvent, Disposable } from 'vscode';
import * as vscode from 'vscode';
import { configuration, FileHistoryViewConfig } from '../../configuration';
import { ContextKeys, setContext } from '../../constants';
import { Container } from '../../container';
import { GitUri } from '../../git/gitUri';
import localize from '../../localize';
import CommitService,{ CommitArrays } from '../../services/Commit';
import Constants from '../../utils/constants';
import { FileHistoryTrackerNode, LineHistoryTrackerNode } from '../nodes';
import { ViewBase } from '../viewBase';
import Controller from '../../controllers/mainController';
import { isBlank } from '../../utils';
import OutputService from '../../services/Output';

export default class FileHistoryChartViewPanel {
  public static currentPanel: FileHistoryChartViewPanel | undefined;

  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(commits: CommitArrays, config: any, context:vscode.ExtensionContext) {
    const column = (vscode.window.activeTextEditor != null) ? vscode.window.activeTextEditor.viewColumn : undefined;
    if (FileHistoryChartViewPanel.currentPanel != null) {
      FileHistoryChartViewPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel('CommitsPanel', 'File History Visual Page', column || vscode.ViewColumn.One,
      {
        enableScripts: true
      }
    );
    //引入chartjs相关组件文件
    const ChartJSFilePath = vscode.Uri.file(
      path.join(context.extensionPath, 'resources', 'chart.umd.min.js')
    );

    const ChartJSAdapterDateFnsPath = vscode.Uri.file(
      path.join(context.extensionPath, 'resources', 'chartjs-adapter-date-fns.bundle.min.js')
    );

    const ChartJSadDayJsPath = vscode.Uri.file(
      path.join(context.extensionPath, 'resources', 'chartjs-adapter-dayjs-4.esm.js')
    );

  /*  const chartJssrc = ChartJSFilePath.with({ scheme: 'vscode-resource' });

    const chartdatefnssrc = ChartJSAdapterDateFnsPath.with({ scheme: 'vscode-resource' });

    const chartdayjssrc = ChartJSadDayJsPath.with({ scheme: 'vscode-resource' });*/

    const chartJssrc = panel.webview.asWebviewUri(ChartJSFilePath);

    const chartdatefnssrc = panel.webview.asWebviewUri(ChartJSAdapterDateFnsPath);

    const chartdayjssrc = panel.webview.asWebviewUri(ChartJSadDayJsPath);

    FileHistoryChartViewPanel.currentPanel = new FileHistoryChartViewPanel(panel, commits.per,commits.spec,config, chartJssrc,chartdatefnssrc,chartdayjssrc);
  }



  private constructor(panel: vscode.WebviewPanel, comitsPerAuthor:any,comitsSpecificAuthor:any, config:any, chartJssrc: vscode.Uri,chartdatefnssrc:vscode.Uri,chartdayjssrc:vscode.Uri) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel = panel;
    const webViewContent = this.getWebviewContent(comitsPerAuthor, comitsSpecificAuthor, config, chartJssrc, chartdatefnssrc, chartdayjssrc);

    // Update chart when user switches to a different file
    vscode.window.onDidChangeActiveTextEditor(async () => {
      if (isBlank(vscode.workspace.rootPath)) return;
      const tmpdir = vscode.window.activeTextEditor?.document.fileName;
      if (isBlank(tmpdir) || tmpdir === undefined) return;
      if (vscode.workspace.rootPath !== undefined && tmpdir !== undefined) {
        try {
          const obj = await CommitService.getCurrentFileCommitHistory(vscode.workspace.rootPath, tmpdir);
          const updateWebViewContent = this.getWebviewContent(obj.per, obj.spec, config, chartJssrc, chartdatefnssrc, chartdayjssrc);
          this._panel.webview.html = updateWebViewContent;
        } catch (error) {
          OutputService.printLine(String(error));
        }
      }
    }, null);

    /*
    vscode.workspace.onDidOpenTextDocument(async (document: vscode.TextDocument) => {
      console.log('！！！！！！！！！！！！！！！！！！！！！！！！！！！///////////11111111111111111111111已打开文档', document.fileName);
      if(isBlank(vscode.workspace.rootPath)) {
        vscode.window.showInformationMessage('Please open a workspace');
        return;
      }
      let tmpdir = vscode.window.activeTextEditor?.document.fileName;
      if(isBlank(tmpdir)||tmpdir==undefined) {
        return;
      }
      console.log(`current file path:${tmpdir}`);
      if(vscode.workspace.rootPath!=undefined&&tmpdir!=undefined){
      try {
        const obj:CommitArrays = await CommitService.getCurrentFileCommitHistory(vscode.workspace.rootPath,tmpdir) as CommitArrays;
        console.log(obj);
         const updateComitsPerAuthor = obj.per;
         const updateCommitsSpecificAuthors = obj.spec;
        console.log(`！！！！！！！！！！！！！！！！！！！！！！！！！！！///////////11111111111111111111111已打开文档current comitsPerAuthor start create panel:${updateComitsPerAuthor}`);
        updateWebViewContent = this.getWebviewContent(updateComitsPerAuthor,updateCommitsSpecificAuthors,config,chartJssrc,chartdatefnssrc,chartdayjssrc);
        this._panel.webview.html = updateWebViewContent;
      } catch(error) {
        OutputService.printLine(error);
      }
    }
  });*/

    this._panel.webview.html = webViewContent;
  }

  /**
   * Builds webview HTML with Chart.js. All user-controlled data (author, message, date)
   * is escaped via JSON.stringify to prevent XSS from malicious commit metadata.
   */
  private getWebviewContent(comitsPerAuthor: any | [], comitsSpecificAuthor: any | [], config: any, chartJssrc: vscode.Uri, chartdatefnssrc: vscode.Uri, chartdayjssrc: vscode.Uri) {
    const labels = comitsPerAuthor.map((c: any) =>
      JSON.stringify(`${c.author ?? ''}(${c.datadate ?? ''})`),
    );
    const authorlabels = comitsSpecificAuthor.map((c: any) =>
      JSON.stringify(c.specificauthor ?? ''),
    );
    const data = comitsPerAuthor.map((c: any) => {
      const t = c.totalCommits;
      return typeof t === 'object' && t != null && 'x' in t && 'y' in t && 'r' in t
        ? t
        : { x: c.datadate ?? '', y: c.author ?? '', r: 0 };
    });
    const dataJson = JSON.stringify(data);
    const labelsJson = `[${labels.join(',')}]`;
    const authorlabelsJson = `[${authorlabels.join(',')}]`;
    const bodyStyle = (config.width > 0 && config.height > 0) ? `body { width: ${config.width}px; height: ${config.height}px }` : '';
    return `<!DOCTYPE html>
          <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>File History Chart</title>
            </head>
            <body>
              <canvas id="myChart"></canvas>
              <button onclick="changeTimeAxisForThreeMonth(chart)">After 2024-07-01</button>
              <button onclick="changeTimeAxisForMonth(chart)">After 2024-12-01</button>
              <script src="${chartJssrc}"></script>
              <script src="${chartdatefnssrc}"></script>
              <script src="${chartdayjssrc}"></script>
              <script>
                const vscode = acquireVsCodeApi();
                document.vscode = vscode;
                var ctx = document.getElementById('myChart');
                var chart = new Chart(ctx, {
                  type: 'bubble',
                  data: {
                    labels: ${labelsJson},
                    datasets: [{
                      label: 'single file commit history',
                      data: ${dataJson},
                      borderWidth: 15,
                      backgroundColor: ${Constants.colors}
                    }]
                  },
                  options: {
                    scales: {
                      x: {
                        type: 'time',
                        distribution: 'series',
                        reverse: true,
                        time: { unit: 'day', displayFormats: { day: 'yyyy-MM-dd' } },
                        title: { display: true, text: '提交日期', font: { family: 'normal', size: 20, weight: 'bold', lineHeight: 1.2 } },
                        min: '2022-01-01'
                      },
                      y: {
                        type: 'category',
                        labels: ${authorlabelsJson},
                        offset: true,
                        position: 'left',
                        stack: 'demo',
                        stackWeight: 1,
                        title: { display: true, text: '提交作者', font: { family: 'normal', size: 20, weight: 'bold', lineHeight: 1.2 } }
                      }
                    },
                    maintainAspectRatio: true,
                    backgroundColor: '#c1c1c1',
                    responsive: true,
                    legend: { display: true }
                  }
                });
                function changeTimeAxisForThreeMonth(chart) {
                  chart.options.scales.x.min = '2024-07-01';
                  chart.update();
                }
                function changeTimeAxisForMonth(chart) {
                  chart.options.scales.x.min = '2024-12-01';
                  chart.update();
                }
              </script>
            <style>
              ${bodyStyle}
              body.vscode-light .username, body.vscode-light .password { color: #616466; }
              body.vscode-dark .username, body.vscode-dark .password { color: #C2C7CC; }
            </style>
          </body>
          </html>`;
  }

    public dispose() {
      FileHistoryChartViewPanel.currentPanel = undefined;
      // Clean up our resources
      this._panel.dispose();

      while (this._disposables.length) {
        const panel = this._disposables.pop();
        if (panel != null) {
          panel.dispose();
        }
      }
    }
}



