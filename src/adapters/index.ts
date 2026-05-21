import type { AdapterName, RulesyncConfig } from '../config';
import { claudeAdapter } from './claude';
import { cursorAdapter } from './cursor';
import { copilotAdapter } from './copilot';
import { geminiAdapter } from './gemini';
import { windsurfAdapter } from './windsurf';
import { clineAdapter } from './cline';
import { aiderAdapter } from './aider';

/**
 * Contract every adapter implements: a stable identifier, one or more output
 * paths, and a pure `render` that turns the source markdown into the
 * tool-specific file body.
 */
export interface Adapter {
  /** The adapter's identifier as it appears in rulesync.config.js. */
  name: AdapterName;
  /** Single output path, or an array of paths that all receive the same body. */
  outputPath: string | string[];
  /** Pure transform from source markdown to the tool-specific file body. */
  render(source: string): string;
}

/** Registry of every adapter shipped with rulesync. */
export const adapters: Record<AdapterName, Adapter> = {
  claude: claudeAdapter,
  cursor: cursorAdapter,
  copilot: copilotAdapter,
  gemini: geminiAdapter,
  windsurf: windsurfAdapter,
  cline: clineAdapter,
  aider: aiderAdapter,
};

/**
 * Return the adapters enabled by the given config, in stable order.
 */
export function enabledAdapters(config: RulesyncConfig): Adapter[] {
  return (Object.keys(adapters) as AdapterName[])
    .filter((name) => config.adapters[name])
    .map((name) => adapters[name]);
}

/**
 * Apply per-adapter header/footer overrides to a rendered body.
 */
export function applyOverrides(
  adapter: Adapter,
  body: string,
  config: RulesyncConfig,
): string {
  const o = config.overrides[adapter.name];
  if (!o) return body;
  return `${o.header ?? ''}${body}${o.footer ?? ''}`;
}

/**
 * Normalize an adapter's `outputPath` to an array.
 */
export function adapterPaths(adapter: Adapter): string[] {
  return Array.isArray(adapter.outputPath)
    ? adapter.outputPath
    : [adapter.outputPath];
}
