import type { Adapter } from './index';

/**
 * Adapter that writes Cline's `.clinerules` file.
 */
export const clineAdapter: Adapter = {
  name: 'cline',
  outputPath: '.clinerules',
  render(source: string): string {
    return source;
  },
};
