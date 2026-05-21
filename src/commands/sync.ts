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
  writeFile,
} from '../utils';
import { TOKEN_WARNING_THRESHOLD, estimateTokens } from '../tokenCounter';

/**
 * Run the `rulesync sync` command: read the source file and write every
 * enabled adapter's target file(s) to disk.
 */
export async function runSync(): Promise<void> {
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

  if (adapters.length === 0) {
    logger.warn('No adapters enabled in rulesync.config.js. Nothing to do.');
    return;
  }

  for (const adapter of adapters) {
    const body = applyOverrides(adapter, adapter.render(source), config);
    for (const outPath of adapterPaths(adapter)) {
      const abs = resolvePath(outPath);
      writeFile(abs, body);
      logger.success(outPath);

      const tokens = estimateTokens(body);
      if (tokens > TOKEN_WARNING_THRESHOLD) {
        logger.warn(
          `${outPath} is ~${tokens} tokens (over the ${TOKEN_WARNING_THRESHOLD}-token soft limit). Consider trimming AGENTS.md.`,
        );
      }
    }
  }

  logger.info(`\nSynced ${adapters.length} adapter(s) from ${config.source}.`);
}
