/**
 * Rollup manual chunks configuration for Vite build.
 * Splits vendor libraries into distinct cacheable chunks.
 */
export function createManualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('lucide-react')) {
      return 'vendor-ui';
    }
    if (id.includes('react') || id.includes('react-dom')) {
      return 'vendor-react';
    }
    if (id.includes('i18next')) {
      return 'vendor-i18n';
    }
    return 'vendor-misc';
  }
  return undefined;
}
