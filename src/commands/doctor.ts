import chalk from 'chalk';
import { checkAllForBootstrap, CheckResult } from '../core/precondition-check';

export function formatReport(results: CheckResult[]): { text: string; exitCode: number } {
  const lines: string[] = [];
  let anyFail = false;

  for (const r of results) {
    if (r.status === 'pass') {
      lines.push(`${chalk.green('  PASS')}  ${r.name.padEnd(20)} ${r.detail ?? ''}`);
    } else if (r.status === 'warn') {
      lines.push(`${chalk.yellow('  WARN')}  ${r.name.padEnd(20)} ${r.detail}`);
      if (r.fix) lines.push(`         → ${r.fix}`);
    } else {
      anyFail = true;
      lines.push(`${chalk.red('  FAIL')}  ${r.name.padEnd(20)} ${r.detail}`);
      lines.push(`         → ${r.fix}`);
    }
  }

  return { text: lines.join('\n'), exitCode: anyFail ? 1 : 0 };
}

export function runDoctor(): void {
  console.log('mdk doctor — health check\n');
  const results = checkAllForBootstrap();
  const { text, exitCode } = formatReport(results);
  console.log(text);
  console.log('');
  if (exitCode === 0) {
    console.log(chalk.green('All checks passed.'));
  } else {
    console.log(chalk.red('One or more checks failed. Fix and re-run.'));
  }
  process.exit(exitCode);
}
