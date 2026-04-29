import type { Adapter } from './index';

/**
 * Adapter that writes Cursor's `.cursorrules` (legacy) and
 * `.cursor/rules/main.md` (modern) rules files.
 *
 * Both files share the same rendered body so we list both target paths.
 */
export const cursorAdapter: Adapter = {
  name: 'cursor',
  outputPath: ['.cursorrules', '.cursor/rules/main.md'],
  render(source: string): string {
    return source;
  },
};
