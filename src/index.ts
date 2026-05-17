import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';

const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

const program = new Command();

program
  .name('mdk')
  .description('Mini Development Kit — contributor CLI for the Ramses Super App platform')
  .version(pkg.version);

program
  .command('bootstrap')
  .description('One-shot setup of both SDK + Engine repos from a clean machine')
  .option('--dir <path>', 'Workspace directory', `${process.env.HOME}/Ramses`)
  .action(async (opts) => {
    await require('./commands/bootstrap').runBootstrap(opts);
  });

program
  .command('doctor')
  .description('Health check — verify node, pnpm, gh, Xcode CLI tools, CocoaPods')
  .action(() => {
    require('./commands/doctor').runDoctor();
  });

const featureCmd = program.command('feature').description('Cross-repo feature management');

featureCmd
  .command('start <name>')
  .description('Create cross-repo feature branches + scaffold')
  .requiredOption('--type <type>', 'Feature type: api | component | permission | constraint')
  .option('--family <family>', 'API family (required when --type api)')
  .option('--dir <path>', 'Workspace directory', `${process.env.HOME}/Ramses`)
  .action(async (name, opts) => {
    await require('./commands/feature-start').runFeatureStart({ name, ...opts });
  });

program.parse();
