import { exec } from '../core/exec';
import { resolveRepoPaths } from '../core/repo-paths';
import chalk from 'chalk';

export function runCodegen(opts: { check?: boolean; dir?: string }): void {
  const paths = resolveRepoPaths(opts.dir ?? `${process.env.HOME}/Ramses`);
  const cmd = opts.check ? 'pnpm contracts:check' : 'pnpm contracts:gen';
  console.log(chalk.bold(`Running ${cmd} in ${paths.sdk}...`));
  const result = exec(cmd, { cwd: paths.sdk });
  if (result.exitCode !== 0) {
    console.error(result.stderr);
    process.exit(result.exitCode);
  }
  console.log(result.stdout);
  console.log(chalk.green('✓ Codegen complete.'));
}
