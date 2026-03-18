/* eslint-disable import/no-default-export */
/**
 * Commit service - fetches git commit history for chart visualizations.
 * Uses execFile (not exec) to avoid command injection from workspace/file paths.
 */
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface CommitArrays {
	per: any;
	spec: any;
}

export default class Commits {
	/** Fetches commit counts per author for a repo. Uses execFile to avoid command injection. */
	public static async getAllPerAuthor(dir: string): Promise<{ totalCommits: string; author: string }[]> {
		const { stdout } = await execFileAsync('git', ['-C', dir, 'shortlog', '-sn', '-e', '--all'], {
			maxBuffer: 1024 * 50 * 1000,
		});
		const lines = stdout.split(/\n/g).slice(0, -1);
		return lines.map((line: string) => {
			const data = line.split('\t');
			return {
				totalCommits: data[0]?.trim() ?? '',
				author: data[1]?.trim() ?? '',
			};
		});
	}


	/**
	 * Fetches commit history for a specific file. Uses execFile (not exec) to avoid
	 * command injection from dir/filepath. Paths passed as separate args, never shell-interpolated.
	 */
	public static async getCurrentFileCommitHistory(dir: string, filepath: string): Promise<CommitArrays> {
		// Run shortlog to get authors and counts - uses -- to separate path from refs
		const { stdout: authorcmdout } = await execFileAsync(
			'git',
			['-C', dir, 'shortlog', '-sn', '-e', '--all', '--', filepath],
			{ maxBuffer: 1024 * 50 * 1000 },
		);
		const tmpauthorcmdouts = authorcmdout.split(/\n/g).slice(0, -1);
		const commitcountarr: string[] = [];
		const commitsSpecificAuthors = tmpauthorcmdouts.map((tmpauthorcmdout: string) => {
			const dataforauthor = tmpauthorcmdout.split('\t');
			commitcountarr.push(dataforauthor[1]?.trim() ?? '', dataforauthor[0]?.trim() ?? '');
			return { specificauthor: dataforauthor[1]?.trim() ?? '' };
		});

		// Run git log for full commit details
		const { stdout: logStdout } = await execFileAsync(
			'git',
			['-C', dir, 'log', '--date=iso-local', '--all', '--', filepath],
			{ maxBuffer: 1024 * 50 * 1000 },
		);
		const lines = logStdout.split(/Author:/g).slice(1);
		const commitsPerAuthors = lines.map((line: string) => {
			const data = line.split('\n');
			const dataauthor = data[0]?.trim() ?? '';
			const tmpdate = data[1]?.split('Date:') ?? [];
			const datadateForTmp = tmpdate[1]?.trim() ?? '';
			const datadateForTmpArray = datadateForTmp.split(' ');
			const datadateforday = datadateForTmpArray[0] ?? '';
			const datatimeforaxies = datadateforday.trim();
			const commitmessage = data[3]?.trim() ?? '';

			let commitcount = '';
			for (let i = 0; i < commitcountarr.length; i++) {
				const tmpCopmpareauthor = commitcountarr[i]?.toString() ?? '';
				if (tmpCopmpareauthor.search(data[0]?.trim() ?? '') !== -1) {
					commitcount = commitcountarr[i + 1]?.toString() ?? '';
					break;
				}
			}

			return {
				totalCommits: { x: datatimeforaxies, y: dataauthor, r: parseInt(commitcount, 10) || 0 },
				author: dataauthor,
				datadate: datadateforday.trim(),
				commitmessage,
			};
		});

		return {
			per: commitsPerAuthors,
			spec: commitsSpecificAuthors,
		};
	}
}
