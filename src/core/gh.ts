import { execOrThrow, exec } from './exec';

export interface GhPr {
  number: number;
  headRefName: string;
  url: string;
  state: 'OPEN' | 'CLOSED' | 'MERGED';
  title?: string;
  body?: string;
}

export function parsePrListJson(raw: string): GhPr[] {
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('Expected JSON array from gh pr list');
  }
  return parsed;
}

export function listPrs(repo: string, opts: { state?: 'open' | 'closed' | 'all'; head?: string } = {}): GhPr[] {
  const args = ['pr', 'list', '--repo', repo, '--json', 'number,headRefName,url,state,title'];
  if (opts.state) args.push('--state', opts.state);
  if (opts.head) args.push('--head', opts.head);
  const raw = execOrThrow(`gh ${args.join(' ')}`);
  return parsePrListJson(raw);
}

export function createPr(opts: {
  repo: string;
  base: string;
  head: string;
  title: string;
  body: string;
  draft?: boolean;
}): GhPr {
  const args = [
    'pr', 'create',
    '--repo', opts.repo,
    '--base', opts.base,
    '--head', opts.head,
    '--title', JSON.stringify(opts.title),
    '--body-file', '-',
  ];
  if (opts.draft) args.push('--draft');
  const url = execOrThrow(`echo ${JSON.stringify(opts.body)} | gh ${args.join(' ')}`).trim();
  const num = parseInt(url.split('/').pop()!, 10);
  return { number: num, headRefName: opts.head, url, state: 'OPEN', title: opts.title };
}

export function updatePrBody(repo: string, prNumber: number, body: string): void {
  execOrThrow(`gh pr edit ${prNumber} --repo ${repo} --body ${JSON.stringify(body)}`);
}

export function getPr(repo: string, prNumber: number): GhPr {
  const raw = execOrThrow(`gh pr view ${prNumber} --repo ${repo} --json number,headRefName,url,state,title,body`);
  return JSON.parse(raw);
}

export function branchExistsOnRemote(repo: string, branch: string): boolean {
  const r = exec(`gh api repos/${repo}/branches/${branch}`);
  return r.exitCode === 0;
}
