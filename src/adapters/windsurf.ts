import type { Adapter } from './index';

/**
 * Adapter that writes Windsurf's `.windsurfrules` file.
 */
export const windsurfAdapter: Adapter = {
  name: 'windsurf',
  outputPath: '.windsurfrules',
  render(source: string): string {
    return source;
  },
};
