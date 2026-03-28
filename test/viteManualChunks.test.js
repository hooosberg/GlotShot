import test from 'node:test';
import assert from 'node:assert/strict';

import { createManualChunks } from '../build/viteManualChunks.mjs';

test('createManualChunks splits large third-party dependencies into stable chunks', () => {
  assert.equal(createManualChunks('/repo/node_modules/react/index.js'), 'vendor-react');
  assert.equal(createManualChunks('/repo/node_modules/react-dom/client.js'), 'vendor-react');
  assert.equal(createManualChunks('/repo/node_modules/lucide-react/dist/esm/lucide-react.js'), 'vendor-ui');
  assert.equal(createManualChunks('/repo/node_modules/i18next/dist/esm/i18next.js'), 'vendor-i18n');
  assert.equal(createManualChunks('/repo/node_modules/some-lib/index.js'), 'vendor-misc');
});

test('createManualChunks keeps app source in the main bundle by default', () => {
  assert.equal(createManualChunks('/repo/src/App.jsx'), undefined);
});
