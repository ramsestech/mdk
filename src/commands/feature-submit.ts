import chalk from 'chalk';
import ora from 'ora';
import { execOrThrow } from '../core/exec';
import { resolveRepoPaths } from '../core/repo-paths';
import { renderTemplate } from '../core/templates';
import { createPr, updatePrBody, GhPr } from '../core/gh';

export interface FeatureSubmitOptions {
  draft?: boolean;
  title?: string;
  dir?: string;
}

const SDK_REPO = 'ramsestech/ramses-sdk-vscode';
const ENGINE_REPO = 'ramsestech/ramses-superapp';

export interface RenderPrBodyOpts {
  featureId: string;
  type: 'api' | 'component' | 'permission' | 'constraint';
}

export function renderPrBody(opts: RenderPrBodyOpts): string {
  return renderTemplate('pr-body.md.tmpl', {
    featureId: opts.featureId,
    checkApi: opts.type === 'api' ? 'x' : ' ',
    checkComponent: opts.type === 'component' ? 'x' : ' ',
    checkPermission: opts.type === 'permission' ? 'x' : ' ',
    checkConstraint: opts.type === 'constraint' ? 'x' : ' ',
  });
}

export function replaceSiblingPlaceholder(body: string, siblingUrl: string): string {
  return body.replace(/^TBD$/m, siblingUrl);
}

function currentBranch(cwd: string): string {
  return execOrThrow(`git rev-parse --abbrev-ref HEAD`, { cwd }).trim();
}

function featureIdFromBranch(branch: string): string {
  if (!branch.startsWith('feature/')) {
    throw new Error(`Current branch '${branch}' does not start with 'feature/'. Are you on a feature branch?`);
  }
  return branch.slice('feature/'.length);
}

function detectType(cwd: string): RenderPrBodyOpts['type'] {
  const msg = execOrThrow(`git log -1 --pretty=%B`, { cwd });
  if (msg.match(/\[api\b/)) return 'api';
  if (msg.match(/\[component\b/)) return 'component';
  if (msg.match(/\[permission\b/)) return 'permission';
  if (msg.match(/\[constraint\b/)) return 'constraint';
  return 'api';
}

export async function runFeatureSubmit(opts: FeatureSubmitOptions): Promise<void> {
  const paths = resolveRepoPaths(opts.dir ?? `${process.env.HOME}/Ramses`);

  const sdkBranch = currentBranch(paths.sdk);
  const engineBranch = currentBranch(paths.engine);

  if (sdkBranch !== engineBranch) {
    throw new Error(`Branch mismatch: SDK on '${sdkBranch}', Engine on '${engineBranch}'. Both must be on the same feature/ branch.`);
  }

  const featureId = featureIdFromBranch(sdkBranch);
  const type = detectType(paths.sdk);
  const title = opts.title ?? `${featureId} (mdk feature submit)`;
  const body = renderPrBody({ featureId, type });

  let spinner = ora('Pushing SDK branch').start();
  try {
    execOrThrow(`git push -u origin ${sdkBranch}`, { cwd: paths.sdk });
    spinner.succeed();
  } catch (err) {
    spinner.fail();
    throw err;
  }

  spinner = ora('Pushing Engine branch').start();
  try {
    execOrThrow(`git push -u origin ${engineBranch}`, { cwd: paths.engine });
    spinner.succeed();
  } catch (err) {
    spinner.fail();
    throw err;
  }

  spinner = ora('Opening SDK PR').start();
  let sdkPr: GhPr;
  try {
    sdkPr = createPr({ repo: SDK_REPO, base: 'dev', head: sdkBranch, title, body, draft: opts.draft });
    spinner.succeed(`SDK PR: ${sdkPr.url}`);
  } catch (err) {
    spinner.fail();
    throw err;
  }

  spinner = ora('Opening Engine PR').start();
  let enginePr: GhPr;
  try {
    enginePr = createPr({ repo: ENGINE_REPO, base: 'sdk/dev', head: engineBranch, title, body, draft: opts.draft });
    spinner.succeed(`Engine PR: ${enginePr.url}`);
  } catch (err) {
    spinner.fail();
    throw err;
  }

  spinner = ora('Linking sibling PRs').start();
  try {
    const sdkBodyWithSibling = replaceSiblingPlaceholder(body, enginePr.url);
    const engineBodyWithSibling = replaceSiblingPlaceholder(body, sdkPr.url);
    updatePrBody(SDK_REPO, sdkPr.number, sdkBodyWithSibling);
    updatePrBody(ENGINE_REPO, enginePr.number, engineBodyWithSibling);
    spinner.succeed();
  } catch (err) {
    spinner.fail();
    throw err;
  }

  console.log(chalk.green('\n✓ Both PRs opened and cross-linked.'));
  console.log(`  SDK:    ${sdkPr.url}`);
  console.log(`  Engine: ${enginePr.url}`);
}
