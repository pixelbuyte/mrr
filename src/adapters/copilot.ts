import type { Adapter } from './index';

/**
 * Adapter that writes GitHub Copilot's repository-level instruction file.
 */
export const copilotAdapter: Adapter = {
  name: 'copilot',
  outputPath: '.github/copilot-instructions.md',
  render(source: string): string {
    return source;
  },
};
