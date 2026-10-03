export interface GitHubCommit {
  sha: string;
  message: string;
  date: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export async function fetchGitHubCommits(_page: number = 1, _perPage: number = 30): Promise<GitHubCommit[]> {
  return [];
}

export function convertCommitsToChangelog(_commits: GitHubCommit[]): ChangelogEntry[] {
  return [];
}

export async function getChangelogEntries(): Promise<ChangelogEntry[]> {
  return [];
}
