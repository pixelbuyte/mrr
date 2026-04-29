#!/usr/bin/env node
import { Command } from 'commander';
import { runInit } from './commands/init';
import { runSync } from './commands/sync';
import { runCheck } from './commands/check';
import { logger } from './utils';

export type { RulesyncConfig, AdapterName, AdapterOverride } from './config';

/**
 * Build and return the rulesync CLI program. Exposed so tests and the
 * GitHub Action entry point can reuse the same command definitions.
 */
export function createProgram(): Command {
  const program = new Command();

  program
    .name('rulesync')
    .description("One file. Every AI tool's rules. Always in sync.")
    .version('0.1.0');

  program
    .command('init')
    .description('Scaffold AGENTS.md and rulesync.config.js')
    .action(async () => {
      try {
        await runInit();
      } catch (err: unknown) {
        logger.error((err as Error).message);
        process.exit(1);
      }
    });

  program
    .command('sync')
    .description('Write every enabled adapter from the source file')
    .action(async () => {
      try {
        await runSync();
      } catch (err: unknown) {
        logger.error((err as Error).message);
        process.exit(1);
      }
    });

  program
    .command('check')
    .description('Verify every adapter file matches the source (CI-friendly)')
    .action(async () => {
      try {
        await runCheck();
      } catch (err: unknown) {
        logger.error((err as Error).message);
        process.exit(1);
      }
    });

  return program;
}

if (require.main === module) {
  createProgram().parseAsync(process.argv);
}
