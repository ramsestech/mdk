import chalk from 'chalk';
import { listPrs, GhPr } from '../core/gh';

const SDK_REPO = 'ramsestech/ramses-sdk-vscode';
const ENGINE_REPO = 'ramsestech/ramses-superapp';

export interface FeatureStatusOptions {
  name?: string;
  mine?: boolean;
}

export async function runFeatureStatus(opts: FeatureStatusOptions): Promise<void> {
  const sdkPrs = listPrs(SDK_REPO, { state: 'open' });
  const enginePrs = listPrs(ENGINE_REPO, { state: 'open' });

  const sdkByBranch = new Map(sdkPrs.map((p) => [p.headRefName, p]));
  const engineByBranch = new Map(enginePrs.map((p) => [p.headRefName, p]));

  const allBranches = new Set<string>(
    [...sdkByBranch.keys(), ...engineByBranch.keys()].filter((b) => b.startsWith('feature/'))
  );

  let filtered: string[] = [...allBranches];
  if (opts.name) {
    filtered = filtered.filter((b) => b === `feature/${opts.name}`);
  }
  if (opts.mine) {
    console.log(chalk.yellow('--mine not yet implemented; showing all features.'));
  }

  if (filtered.length === 0) {
    console.log('No in-flight features.');
    return;
  }

  for (const branch of filtered) {
    const sdkPr = sdkByBranch.get(branch);
    const enginePr = engineByBranch.get(branch);
    const featureId = branch.slice('feature/'.length);

    console.log(chalk.bold(`\n${featureId}`));
    console.log(`  SDK:    ${formatPr(sdkPr)}`);
    console.log(`  Engine: ${formatPr(enginePr)}`);
  }
}

function formatPr(pr: GhPr | undefined): string {
  if (!pr) return chalk.yellow('(no PR yet)');
  return `${pr.url} ${chalk.dim('(' + pr.state + ')')}`;
}
