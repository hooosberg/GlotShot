import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildProjectWindowTitle,
  createProjectSnapshot,
  PROJECT_DOCUMENT_SCHEMA,
  PROJECT_DOCUMENT_VERSION,
  createProjectDocument,
  parseProjectDocument,
} from '../src/services/projectDocument.js';

const sampleProjectState = {
  projectName: 'Demo Project',
  appMode: 'screenshot',
  globalSettings: {
    width: 2880,
    height: 1800,
    backgroundType: 'preset',
    backgroundValue: 'wood',
    primaryLang: 'zh-CN',
    secondaryLangs: ['en', 'ja'],
    secondaryLang: 'en',
  },
  uploadedBackgrounds: [
    { id: 'bg-1', name: 'hero.png', data: 'data:image/png;base64,ZmFrZQ==' },
  ],
  backgroundFolderPath: '/tmp/backgrounds',
  selectedPlatform: 'mac',
  customSizePresets: [
    { id: 'custom-1', name: 'Launch', width: 2000, height: 1200, category: 'custom' },
  ],
  mockup: {
    enabled: true,
    selectedDevice: 'iphone-17-pro-max',
    frameColor: '#111111',
    showLockScreenUI: false,
    showMockupShadow: true,
    shadowOpacity: 0.5,
    deviceScale: 1.08,
    deviceX: 20,
    deviceY: 180,
    iPadLandscape: true,
  },
  scenes: [
    {
      id: 1,
      name: 'Scene 1',
      screenshot: {
        name: 'screen-1.png',
        data: 'data:image/png;base64,c2NyZWVu',
      },
      titleCN: '你好',
      titleEN: 'Hello',
      titles: {
        'zh-CN': '你好',
        en: 'Hello',
      },
      settings: {
        screenshotScale: 1.2,
        screenshotX: 40,
      },
    },
  ],
  activeSceneId: 1,
  previewLanguage: 'en',
  selectedElement: 'screenshot',
};

test('createProjectDocument preserves project state in a versioned schema', () => {
  const document = createProjectDocument(sampleProjectState);

  assert.equal(document.schema, PROJECT_DOCUMENT_SCHEMA);
  assert.equal(document.version, PROJECT_DOCUMENT_VERSION);
  assert.equal(document.project.name, sampleProjectState.projectName);
  assert.equal(document.project.mode, sampleProjectState.appMode);
  assert.equal(document.project.selectedPlatform, sampleProjectState.selectedPlatform);
  assert.deepEqual(document.project.scenes, sampleProjectState.scenes);
  assert.deepEqual(document.project.mockup, sampleProjectState.mockup);
});

test('parseProjectDocument returns normalized project data for valid documents', () => {
  const raw = JSON.stringify(createProjectDocument(sampleProjectState));

  const parsed = parseProjectDocument(raw);

  assert.equal(parsed.project.name, sampleProjectState.projectName);
  assert.equal(parsed.project.mode, 'screenshot');
  assert.equal(parsed.project.activeSceneId, 1);
  assert.equal(parsed.project.previewLanguage, 'en');
  assert.equal(parsed.project.selectedElement, 'screenshot');
  assert.deepEqual(parsed.project.customSizePresets, sampleProjectState.customSizePresets);
  assert.deepEqual(parsed.project.uploadedBackgrounds, sampleProjectState.uploadedBackgrounds);
});

test('parseProjectDocument rejects files that are not GlotShot project documents', () => {
  assert.throws(
    () => parseProjectDocument(JSON.stringify({ hello: 'world' })),
    /Invalid GlotShot project document/
  );
});

test('createProjectSnapshot is stable for dirty-state comparisons', () => {
  const snapshotA = createProjectSnapshot(sampleProjectState);
  const snapshotB = createProjectSnapshot(sampleProjectState);

  assert.equal(snapshotA, snapshotB);
  assert.equal(JSON.parse(snapshotA).savedAt, undefined);
});

test('buildProjectWindowTitle follows project name with app suffix', () => {
  assert.equal(
    buildProjectWindowTitle('Marketing Launch'),
    'Marketing Launch - GlotShot'
  );

  assert.equal(
    buildProjectWindowTitle('', { fallbackName: 'Untitled Project', appName: 'GlotShot' }),
    'Untitled Project - GlotShot'
  );
});
