import { existsSync, writeFileSync, readFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { execOrThrow } from '../core/exec';
import { resolveRepoPaths } from '../core/repo-paths';
import { renderTemplate } from '../core/templates';

const FEATURE_NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALID_TYPES = ['api', 'component', 'permission', 'constraint'] as const;
export type FeatureType = (typeof VALID_TYPES)[number];

export function validateFeatureName(name: string): void {
  if (!name) throw new Error('Feature name is required.');
  if (!FEATURE_NAME_RE.test(name)) {
    throw new Error(`Invalid feature name '${name}'. Use kebab-case (lowercase, hyphens, no slashes).`);
  }
}

export function validateType(type: string): void {
  if (!VALID_TYPES.includes(type as FeatureType)) {
    throw new Error(`Invalid type '${type}'. Must be one of: ${VALID_TYPES.join(', ')}.`);
  }
}

export interface FeatureStartOptions {
  name: string;
  type: FeatureType;
  family?: string;
  dir?: string;
}

export async function runFeatureStart(opts: FeatureStartOptions): Promise<void> {
  validateFeatureName(opts.name);
  validateType(opts.type);
  if (opts.type === 'api' && !opts.family) {
    throw new Error('--family is required when --type is api.');
  }

  const workspaceDir = opts.dir ?? `${process.env.HOME}/Ramses`;
  const paths = resolveRepoPaths(workspaceDir);
  const branch = `feature/${opts.name}`;

  let spinner = ora(`Creating ${branch} on SDK`).start();
  try {
    execOrThrow(`git fetch origin`, { cwd: paths.sdk });
    execOrThrow(`git switch -c ${branch} origin/dev`, { cwd: paths.sdk });
    spinner.succeed();
  } catch (err) {
    spinner.fail();
    throw err;
  }

  spinner = ora(`Creating ${branch} on Engine`).start();
  try {
    execOrThrow(`git fetch origin`, { cwd: paths.engine });
    execOrThrow(`git switch -c ${branch} origin/sdk/dev`, { cwd: paths.engine });
    spinner.succeed();
  } catch (err) {
    spinner.fail();
    throw err;
  }

  if (opts.type === 'api') {
    spinner = ora('Scaffolding SSOT entry + handler stub').start();
    try {
      scaffoldApi(opts.name, opts.family!, paths);
      spinner.succeed();
    } catch (err) {
      spinner.fail();
      throw err;
    }
  }

  spinner = ora('Committing scaffold').start();
  try {
    execOrThrow(`git add -A`, { cwd: paths.sdk });
    execOrThrow(`git commit -m "scaffold(${opts.name}): mdk feature start [${opts.type}${opts.family ? ' ' + opts.family : ''}]"`, { cwd: paths.sdk });
    execOrThrow(`git add -A`, { cwd: paths.engine });
    execOrThrow(`git commit -m "scaffold(${opts.name}): mdk feature start [${opts.type}${opts.family ? ' ' + opts.family : ''}]"`, { cwd: paths.engine });
    spinner.succeed();
  } catch (err) {
    spinner.fail();
    throw err;
  }

  console.log(chalk.green(`\n✓ Feature ${opts.name} scaffolded.`));
  console.log(`  SDK branch:    ${paths.sdk}#${branch}`);
  console.log(`  Engine branch: ${paths.engine}#${branch}`);
  console.log(`\nNext: edit the SSOT entry, run \`mdk codegen\`, implement the handler, run tests, then \`mdk feature submit\`.`);
}

function scaffoldApi(featureName: string, family: string, paths: { sdk: string; engine: string }): void {
  const familyFile = join(paths.sdk, 'packages', 'contracts', 'src', 'apis', `${family}.ts`);
  const platformVersion = readFileSync(join(paths.sdk, 'PLATFORM_VERSION'), 'utf8').trim();
  const platformShort = platformVersion.split('.').slice(0, 2).join('.');

  const lastSegment = featureName.split('-').pop()!;
  const methodName = lastSegment;
  const Family = family[0].toUpperCase() + family.slice(1);

  const apiStub = renderTemplate('api-stub.ts.tmpl', {
    Family,
    methodName,
    platformVersion: platformShort,
    description: `${methodName} — TODO scaffold-author fills in`,
  });

  if (existsSync(familyFile)) {
    appendFileSync(familyFile, '\n' + apiStub + '\n');
  } else {
    const newFamily = `// New family file for rs.${Family} — auto-scaffolded by mdk feature start.\nimport { defineApi } from '../core/builders';\n\nexport const ${family}Apis = [\n${apiStub}\n];\n`;
    writeFileSync(familyFile, newFamily);
  }

  const handlerFile = join(paths.engine, 'src', 'minis-engine', 'bridge', 'handlers', `${family}Handler.ts`);
  const handlerStub = renderTemplate('handler-stub.ts.tmpl', { methodName });
  if (existsSync(handlerFile)) {
    appendFileSync(handlerFile, '\n' + handlerStub + '\n');
  } else {
    const newHandler = `// Auto-scaffolded by mdk feature start.\nimport type { HandlerContext } from './_types';\n\n${handlerStub}\n`;
    writeFileSync(handlerFile, newHandler);
  }
}
