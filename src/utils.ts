import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

/**
 * Whether the current process is attached to a TTY. Used to disable color
 * output in CI logs and other non-interactive environments.
 */
export const isTTY: boolean = Boolean(process.stdout.isTTY);

if (!isTTY) {
  // Disable chalk colors when not a TTY (e.g. CI logs).
  chalk.level = 0;
}

/**
 * Logger that writes color-coded status messages to stdout/stderr.
 * Falls back to plain text when stdout is not a TTY.
 */
export const logger = {
  /** Log an informational message. */
  info(msg: string): void {
    process.stdout.write(`${msg}\n`);
  },
  /** Log a success message prefixed with a green check mark. */
  success(msg: string): void {
    process.stdout.write(`${chalk.green('✓')} ${msg}\n`);
  },
  /** Log a warning message prefixed with a yellow warning sign. */
  warn(msg: string): void {
    process.stdout.write(`${chalk.yellow('⚠')} ${msg}\n`);
  },
  /** Log an error message prefixed with a red cross. */
  error(msg: string): void {
    process.stderr.write(`${chalk.red('✗')} ${msg}\n`);
  },
};

/**
 * Read a UTF-8 text file from disk, returning null if it does not exist.
 */
export function readFileIfExists(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

/**
 * Write a UTF-8 text file, ensuring its parent directory exists first.
 */
export function writeFile(filePath: string, contents: string): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, contents, 'utf8');
}

/**
 * Resolve a path against the current working directory.
 */
export function resolvePath(p: string): string {
  return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}

/**
 * Whether a file exists on disk.
 */
export function fileExists(p: string): boolean {
  return fs.existsSync(p);
}
