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

program.parse();
