import * as path from 'path';
import { fileExists, resolvePath } from './utils';

/**
 * Per-adapter override values that wrap an adapter's rendered output.
 */
export interface AdapterOverride {
  /** Text to prepend to the rendered file contents. */
  header?: string;
  /** Text to append to the rendered file contents. */
  footer?: string;
}

/**
 * The canonical list of adapter identifiers supported by rulesync.
 */
export type AdapterName =
  | 'claude'
  | 'cursor'
  | 'copilot'
  | 'gemini'
  | 'windsurf'
  | 'cline'
  | 'aider';

/** All adapter names in the order they are listed to the user. */
export const ALL_ADAPTERS: AdapterName[] = [
  'claude',
  'cursor',
  'copilot',
  'gemini',
  'windsurf',
  'cline',
  'aider',
];

/**
 * The fully resolved configuration object that drives every command.
 */
export interface RulesyncConfig {
  /** Path to the source-of-truth markdown file (default: AGENTS.md). */
  source: string;
  /** Map of adapter name -> whether it should run. */
  adapters: Record<AdapterName, boolean>;
  /** Map of adapter name -> header/footer overrides. */
  overrides: Partial<Record<AdapterName, AdapterOverride>>;
}

/**
 * The default configuration used when no rulesync.config.js is present.
 */
export function defaultConfig(): RulesyncConfig {
  return {
    source: 'AGENTS.md',
    adapters: {
      claude: true,
      cursor: true,
      copilot: true,
      gemini: true,
      windsurf: true,
      cline: true,
      aider: false,
    },
    overrides: {},
  };
}

/**
 * Load `rulesync.config.js` from the current working directory if present,
 * shallow-merging it on top of the defaults. Missing files fall back to the
 * default configuration.
 */
export function loadConfig(cwd: string = process.cwd()): RulesyncConfig {
  const cfgPath = path.join(cwd, 'rulesync.config.js');
  const base = defaultConfig();
  if (!fileExists(cfgPath)) return base;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const userCfg = require(resolvePath(cfgPath)) as Partial<RulesyncConfig>;
  return {
    source: userCfg.source ?? base.source,
    adapters: { ...base.adapters, ...(userCfg.adapters ?? {}) },
    overrides: { ...base.overrides, ...(userCfg.overrides ?? {}) },
  };
}
