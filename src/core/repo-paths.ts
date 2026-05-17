import { join, normalize } from 'path';

export interface RepoPaths {
  workspace: string;
  sdk: string;
  engine: string;
}

export function resolveRepoPaths(workspaceDir: string): RepoPaths {
  const workspace = normalize(workspaceDir).replace(/\/$/, '');
  return {
    workspace,
    sdk: join(workspace, 'sdk'),
    engine: join(workspace, 'RamsesSuperapp', 'superapp-v2'),
  };
}
