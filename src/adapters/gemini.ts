import type { Adapter } from './index';

/**
 * Adapter that writes the Gemini CLI's GEMINI.md rules file.
 */
export const geminiAdapter: Adapter = {
  name: 'gemini',
  outputPath: 'GEMINI.md',
  render(source: string): string {
    return source;
  },
};
