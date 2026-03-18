/**
 * Kylin controller: shows commit chart panels (repo-wide and per-file).
 * Invoked by kylin.viewCommits and kylin.viewfilehistory commands.
 */
/* eslint-disable import/no-default-export */
import * as vscode from 'vscode';
import CommitService, {CommitArrays} from '../services/Commit';
import ConfigurationService from '../services/Configuration';
import OutputService from '../services/Output';
import { isBlank } from '../utils';
import CommitsPanel from '../views/commits-panel/CommitsPanel';
import FileHistoryChartViewPanel from '../views/commits-panel/FileHistoryChartViewPanel';

export default class {
  context:vscode.ExtensionContext;
  constructor (context:vscode.ExtensionContext) {
    this.context = context;
  }
  public async showCommitsPanel() {
    if(isBlank(vscode.workspace.rootPath)) {
      vscode.window.showInformationMessage('Please open a workspace');
      return;
    }
    const config = ConfigurationService.getCommitChartConfiguration();
    try {
      const commitsPerAuthor = await CommitService.getAllPerAuthor(vscode.workspace.rootPath || '');
      CommitsPanel.createOrShow(commitsPerAuthor, config, this.context);
    } catch (error) {
      OutputService.printLine(String(error));
    }

  }

  public async showsinglefileCommitsPanel() {
    if(isBlank(vscode.workspace.rootPath)) {
      vscode.window.showInformationMessage('Please open a workspace');
      return;
    }
    const tmpdir = vscode.window.activeTextEditor?.document.fileName;
    if (isBlank(tmpdir) || tmpdir === undefined) {
      vscode.window.showInformationMessage('Please open file');
      return;
    }
    const config = ConfigurationService.getCommitChartConfiguration();
    if (vscode.workspace.rootPath !== undefined && tmpdir !== undefined) {
      try {
        const obj = await CommitService.getCurrentFileCommitHistory(vscode.workspace.rootPath, tmpdir);
        FileHistoryChartViewPanel.createOrShow(obj, config, this.context);
      } catch (error) {
        OutputService.printLine(String(error));
      }
    }
  }
}
