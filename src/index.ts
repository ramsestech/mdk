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
  .description('One-shot setup of both SDK + Engine repos (not yet implemented)')
  .option('--dir <path>', 'Workspace directory', `${process.env.HOME}/Ramses`)
  .action(() => {
    console.log('mdk bootstrap: not yet implemented (Phase 2)');
    process.exit(1);
  });

program
  .command('doctor')
  .description('Health check — verify node, pnpm, gh, Xcode CLI tools, CocoaPods')
  .action(() => {
    require('./commands/doctor').runDoctor();
  });

program.parse();
