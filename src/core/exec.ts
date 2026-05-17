import { spawnSync } from 'child_process';

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export function exec(command: string, opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {}): ExecResult {
  const result = spawnSync(command, {
    shell: true,
    cwd: opts.cwd,
    env: { ...process.env, ...opts.env },
    encoding: 'utf8',
  });

  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    exitCode: result.status ?? 1,
  };
}

export function execOrThrow(command: string, opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {}): string {
  const result = exec(command, opts);
  if (result.exitCode !== 0) {
    throw new Error(`Command failed (exit ${result.exitCode}): ${command}\nstderr: ${result.stderr}`);
  }
  return result.stdout;
}
