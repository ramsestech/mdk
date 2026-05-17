import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { exec, execOrThrow } from '../core/exec';
import { resolveRepoPaths, RepoPaths } from '../core/repo-paths';
import { checkAllForBootstrap } from '../core/precondition-check';
import { formatReport } from './doctor';

export interface BootstrapOptions {
  dir: string;
}

export interface BootstrapStep {
  id: string;
  label: string;
  run: (ctx: BootstrapContext) => Promise<void> | void;
}

export interface BootstrapContext {
  paths: RepoPaths;
}

export function listSteps(): BootstrapStep[] {
  return [
    { id: 'check-preconditions', label: 'Verifying prerequisites', run: stepCheckPreconditions },
    { id: 'ensure-workspace-dir', label: 'Preparing workspace directory', run: stepEnsureWorkspaceDir },
    { id: 'clone-sdk', label: 'Cloning SDK', run: stepCloneSdk },
    { id: 'clone-engine', label: 'Cloning Engine', run: stepCloneEngine },
    { id: 'install-hooks', label: 'Installing git hooks on both repos', run: stepInstallHooks },
    { id: 'build-sdk', label: 'Building SDK (pnpm install + build)', run: stepBuildSdk },
    { id: 'pack-tarballs', label: 'Packing SDK tarballs', run: stepPackTarballs },
    { id: 'install-sdk-tool', label: 'Installing @ramses-superapp/sdk-tool globally from npm', run: stepInstallSdkTool },
    { id: 'wire-engine-deps', label: 'Wiring Engine package.json to local tarballs', run: stepWireEngineDeps },
    { id: 'engine-install', label: 'Engine npm install + pod-install', run: stepEngineInstall },
    { id: 'verify-doctor', label: 'Final mdk doctor verification', run: stepVerifyDoctor },
  ];
}

async function stepCheckPreconditions(_ctx: BootstrapContext): Promise<void> {
  const results = checkAllForBootstrap();
  const { text, exitCode } = formatReport(results);
  if (exitCode !== 0) {
    console.log(text);
    throw new Error('Preconditions not met. Resolve the FAIL items above and re-run mdk bootstrap.');
  }
}

function stepEnsureWorkspaceDir(ctx: BootstrapContext): void {
  if (!existsSync(ctx.paths.workspace)) {
    mkdirSync(ctx.paths.workspace, { recursive: true });
  }
}

function stepCloneSdk(ctx: BootstrapContext): void {
  if (existsSync(join(ctx.paths.sdk, '.git'))) {
    return;
  }
  execOrThrow(
    `git clone git@github.com:ramsestech/ramses-sdk-vscode.git sdk`,
    { cwd: ctx.paths.workspace }
  );
}

function stepCloneEngine(ctx: BootstrapContext): void {
  if (existsSync(join(ctx.paths.engine, '.git'))) {
    return;
  }
  mkdirSync(join(ctx.paths.workspace, 'RamsesSuperapp'), { recursive: true });
  execOrThrow(
    `git clone git@github.com:ramsestech/ramses-superapp.git superapp-v2`,
    { cwd: join(ctx.paths.workspace, 'RamsesSuperapp') }
  );
}

function stepInstallHooks(ctx: BootstrapContext): void {
  for (const repo of [ctx.paths.sdk, ctx.paths.engine]) {
    const hookInstaller = join(repo, '.githooks', 'install.sh');
    if (existsSync(hookInstaller)) {
      execOrThrow(`bash ${hookInstaller}`, { cwd: repo });
    }
  }
}

function stepBuildSdk(ctx: BootstrapContext): void {
  execOrThrow(`pnpm install`, { cwd: ctx.paths.sdk });
  execOrThrow(`pnpm run build`, { cwd: ctx.paths.sdk });
}

function stepPackTarballs(ctx: BootstrapContext): void {
  execOrThrow(`bash scripts/pack-internal.sh`, { cwd: ctx.paths.sdk });
}

function stepInstallSdkTool(ctx: BootstrapContext): void {
  const platformVersion = readFileSync(join(ctx.paths.sdk, 'PLATFORM_VERSION'), 'utf8').trim();
  execOrThrow(`npm install -g @ramses-superapp/sdk-tool@${platformVersion}`);
}

function stepWireEngineDeps(ctx: BootstrapContext): void {
  const platformVersion = readFileSync(join(ctx.paths.sdk, 'PLATFORM_VERSION'), 'utf8').trim();
  const pkgPath = join(ctx.paths.engine, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.dependencies['@ramses-superapp/cli'] = `file:../../sdk/release/ramses-superapp-cli-${platformVersion}.tgz`;
  pkg.dependencies['@ramses-superapp/logic'] = `file:../../sdk/release/ramses-superapp-logic-${platformVersion}.tgz`;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function stepEngineInstall(ctx: BootstrapContext): void {
  execOrThrow(`npm install --legacy-peer-deps`, { cwd: ctx.paths.engine });
  const podsResult = exec(`npx pod-install`, { cwd: ctx.paths.engine });
  if (podsResult.exitCode !== 0) {
    console.warn(chalk.yellow(`pod-install failed (likely non-Mac environment). Continuing.`));
  }
}

function stepVerifyDoctor(_ctx: BootstrapContext): void {
  const results = checkAllForBootstrap();
  const { text, exitCode } = formatReport(results);
  if (exitCode !== 0) {
    console.log(text);
    throw new Error('Post-install doctor reports issues.');
  }
}

export async function runBootstrap(opts: BootstrapOptions): Promise<void> {
  const paths = resolveRepoPaths(opts.dir);
  const ctx: BootstrapContext = { paths };

  console.log(chalk.bold(`\nmdk bootstrap → ${paths.workspace}\n`));

  for (const step of listSteps()) {
    const spinner = ora(step.label).start();
    try {
      await step.run(ctx);
      spinner.succeed();
    } catch (err) {
      spinner.fail();
      console.error(chalk.red(`\nFAILED: ${step.label}`));
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  }

  console.log(chalk.green('\n✓ Bootstrap complete!\n'));
  console.log('Next steps:');
  console.log(`  cd ${paths.engine}`);
  console.log(`  npm run ios:sim`);
  console.log(`  → Then read CONTRIBUTING.md and the Outline contributor guide.`);
}
