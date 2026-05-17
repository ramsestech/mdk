import { gte, valid } from 'semver';
import { exec } from './exec';

export type CheckResult =
  | { status: 'pass'; name: string; detail?: string }
  | { status: 'warn'; name: string; detail: string; fix?: string }
  | { status: 'fail'; name: string; detail: string; fix: string };

export function parseNodeVersion(raw: string): string | null {
  const trimmed = raw.trim().replace(/^v/, '');
  return valid(trimmed);
}

export function meetsMinVersion(actual: string, minimum: string): boolean {
  return gte(actual, minimum);
}

export function checkNode(minVersion = '20.0.0'): CheckResult {
  const r = exec('node --version');
  const parsed = parseNodeVersion(r.stdout);
  if (!parsed) {
    return { status: 'fail', name: 'node', detail: 'node not found on PATH', fix: 'Install Node 20+ via nvm or homebrew' };
  }
  if (!meetsMinVersion(parsed, minVersion)) {
    return { status: 'fail', name: 'node', detail: `node ${parsed} < ${minVersion}`, fix: 'Upgrade Node to 20+ via nvm or homebrew' };
  }
  return { status: 'pass', name: 'node', detail: `v${parsed}` };
}

export function checkPnpm(): CheckResult {
  const r = exec('pnpm --version');
  if (r.exitCode !== 0) {
    return { status: 'fail', name: 'pnpm', detail: 'pnpm not on PATH', fix: 'npm install -g pnpm' };
  }
  return { status: 'pass', name: 'pnpm', detail: r.stdout.trim() };
}

export function checkGh(): CheckResult {
  const v = exec('gh --version');
  if (v.exitCode !== 0) {
    return { status: 'fail', name: 'gh CLI', detail: 'gh not found', fix: 'brew install gh' };
  }
  const auth = exec('gh auth status');
  if (auth.exitCode !== 0) {
    return { status: 'fail', name: 'gh auth', detail: 'gh CLI not authenticated', fix: 'gh auth login' };
  }
  return { status: 'pass', name: 'gh CLI', detail: 'authenticated' };
}

export function checkXcodeCli(): CheckResult {
  const r = exec('xcode-select -p');
  if (r.exitCode !== 0) {
    return { status: 'fail', name: 'Xcode CLI tools', detail: 'not installed', fix: 'xcode-select --install' };
  }
  return { status: 'pass', name: 'Xcode CLI tools', detail: r.stdout.trim() };
}

export function checkCocoaPods(): CheckResult {
  const r = exec('pod --version');
  if (r.exitCode !== 0) {
    return { status: 'fail', name: 'CocoaPods', detail: 'pod not on PATH', fix: 'brew install cocoapods' };
  }
  return { status: 'pass', name: 'CocoaPods', detail: r.stdout.trim() };
}

export function checkAllForBootstrap(): CheckResult[] {
  return [checkNode(), checkPnpm(), checkGh(), checkXcodeCli(), checkCocoaPods()];
}
