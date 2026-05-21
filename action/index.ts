import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { runSync } from '../src/commands/sync';
import { runCheck } from '../src/commands/check';

/**
 * Entry point for the rulesync GitHub Action.
 *
 * Inputs:
 *  - mode: 'check' (default) or 'sync'
 *  - source: source markdown path (default 'AGENTS.md')
 *
 * In `sync` mode, after generating files this action stages and commits any
 * resulting changes with a `[skip ci]` message so workflows do not loop.
 */
async function main(): Promise<void> {
  const mode = (core.getInput('mode') || 'check').trim();
  const source = (core.getInput('source') || 'AGENTS.md').trim();

  if (source) process.env.RULESYNC_SOURCE = source;

  try {
    if (mode === 'check') {
      core.info('Running rulesync check...');
      await runCheck();
      core.info('All rule files are in sync.');
    } else if (mode === 'sync') {
      core.info('Running rulesync sync...');
      await runSync();
      await commitChanges();
    } else {
      core.setFailed(`Unknown mode '${mode}'. Use 'check' or 'sync'.`);
    }
  } catch (err: unknown) {
    core.setFailed((err as Error).message);
  }
}

/**
 * Stage every change in the working tree and create a `[skip ci]` commit.
 * No-ops cleanly when nothing has changed.
 */
async function commitChanges(): Promise<void> {
  await exec.exec('git', ['config', 'user.name', 'github-actions[bot]']);
  await exec.exec('git', [
    'config',
    'user.email',
    '41898282+github-actions[bot]@users.noreply.github.com',
  ]);
  await exec.exec('git', ['add', '-A']);

  let diffCode = 0;
  await exec.exec('git', ['diff', '--cached', '--quiet'], {
    ignoreReturnCode: true,
    listeners: {
      // exec returns non-zero when there ARE staged changes
      errline: () => undefined,
    },
  }).then((code) => {
    diffCode = code;
  });

  if (diffCode === 0) {
    core.info('No changes to commit.');
    return;
  }

  await exec.exec('git', [
    'commit',
    '-m',
    'chore: sync AI agent rule files [skip ci]',
  ]);
  core.info('Committed updated rule files.');
}

void main();
