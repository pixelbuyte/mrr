import type { Adapter } from './index';

/**
 * Adapter that writes Claude Code's CLAUDE.md rules file.
 */
export const claudeAdapter: Adapter = {
  name: 'claude',
  outputPath: 'CLAUDE.md',
  render(source: string): string {
    return source;
  },
};
