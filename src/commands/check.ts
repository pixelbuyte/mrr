import { loadConfig } from '../config';
import {
  adapterPaths,
  applyOverrides,
  enabledAdapters,
} from '../adapters';
import {
  fileExists,
  logger,
  readFileIfExists,
  resolvePath,
} from '../utils';

/**
 * Run the `rulesync check` command: regenerate every enabled adapter's
 * output in memory and compare against the on-disk file. Exits with code 1
 * if any drift is detected, or 0 if everything is in sync.
 *
 * Designed for CI: clean output and no color when not a TTY.
 */
export async function runCheck(): Promise<void> {
  const config = loadConfig();
  const sourcePath = resolvePath(config.source);

  if (!fileExists(sourcePath)) {
    logger.error(
      `Source file '${config.source}' not found. Run 'rulesync init' to create one.`,
    );
    process.exit(1);
  }

  const source = readFileIfExists(sourcePath) ?? '';
  const adapters = enabledAdapters(config);
  const drifted: string[] = [];

  for (const adapter of adapters) {
    const expected = applyOverrides(adapter, adapter.render(source), config);
    for (const outPath of adapterPaths(adapter)) {
      const actual = readFileIfExists(resolvePath(outPath));
      if (actual !== expected) drifted.push(outPath);
    }
  }

  if (drifted.length > 0) {
    logger.error('Rule files are out of sync:');
    for (const f of drifted) logger.error(`  - ${f}`);
    logger.info("\nRun 'rulesync sync' to regenerate them.");
    process.exit(1);
  }

  logger.success('All rule files are in sync');
}
