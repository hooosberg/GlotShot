export const PROJECT_DOCUMENT_SCHEMA = 'glotshot-project';
export const PROJECT_DOCUMENT_VERSION = 1;
export const PROJECT_FILE_EXTENSION = 'glotshot';

const DEFAULT_PROJECT_STATE = {
  projectName: 'Untitled',
  appMode: 'screenshot',
  globalSettings: {},
  uploadedBackgrounds: [],
  backgroundFolderPath: '',
  selectedPlatform: 'mac',
  customSizePresets: [],
  mockup: {
    enabled: false,
    selectedDevice: 'iphone-17-pro-max',
    frameColor: '#1C1C1E',
    showLockScreenUI: false,
    showMockupShadow: true,
    shadowOpacity: 0.5,
    deviceScale: 1,
    deviceX: 0,
    deviceY: 400,
    iPadLandscape: true,
  },
  scenes: [],
  activeSceneId: 1,
  previewLanguage: 'zh-CN',
  selectedElement: 'text',
};

const cloneJson = (value) => JSON.parse(JSON.stringify(value));

function buildNormalizedProjectState(projectState = {}) {
  const merged = {
    ...DEFAULT_PROJECT_STATE,
    ...cloneJson(projectState),
    mockup: {
      ...DEFAULT_PROJECT_STATE.mockup,
      ...(projectState.mockup ? cloneJson(projectState.mockup) : {}),
    },
  };

  return {
    name: merged.projectName,
    mode: merged.appMode,
    globalSettings: cloneJson(merged.globalSettings),
    uploadedBackgrounds: cloneJson(merged.uploadedBackgrounds),
    backgroundFolderPath: merged.backgroundFolderPath || '',
    selectedPlatform: merged.selectedPlatform || 'mac',
    customSizePresets: cloneJson(merged.customSizePresets),
    mockup: cloneJson(merged.mockup),
    scenes: cloneJson(merged.scenes),
    activeSceneId: merged.activeSceneId ?? 1,
    previewLanguage: merged.previewLanguage || 'zh-CN',
    selectedElement: merged.selectedElement || 'text',
  };
}

export function createProjectDocument(projectState = {}, options = {}) {
  const { includeSavedAt = true } = options;
  const project = buildNormalizedProjectState(projectState);

  return {
    schema: PROJECT_DOCUMENT_SCHEMA,
    version: PROJECT_DOCUMENT_VERSION,
    ...(includeSavedAt ? { savedAt: new Date().toISOString() } : {}),
    project,
  };
}

export function createProjectSnapshot(projectState = {}) {
  return JSON.stringify(createProjectDocument(projectState, { includeSavedAt: false }));
}

export function buildProjectWindowTitle(projectName, options = {}) {
  const {
    appName = 'GlotShot',
    fallbackName = DEFAULT_PROJECT_STATE.projectName,
  } = options;

  const normalizedName = String(projectName || fallbackName).trim() || fallbackName;
  return `${normalizedName} - ${appName}`;
}

export function parseProjectDocument(rawDocument) {
  const parsed = typeof rawDocument === 'string'
    ? JSON.parse(rawDocument)
    : rawDocument;

  if (
    !parsed ||
    parsed.schema !== PROJECT_DOCUMENT_SCHEMA ||
    typeof parsed.project !== 'object' ||
    parsed.project === null
  ) {
    throw new Error('Invalid GlotShot project document');
  }

  const project = parsed.project;

  return {
    schema: PROJECT_DOCUMENT_SCHEMA,
    version: parsed.version ?? PROJECT_DOCUMENT_VERSION,
    savedAt: parsed.savedAt || null,
    project: {
      name: project.name || DEFAULT_PROJECT_STATE.projectName,
      mode: project.mode || DEFAULT_PROJECT_STATE.appMode,
      globalSettings: cloneJson(project.globalSettings || DEFAULT_PROJECT_STATE.globalSettings),
      uploadedBackgrounds: cloneJson(project.uploadedBackgrounds || DEFAULT_PROJECT_STATE.uploadedBackgrounds),
      backgroundFolderPath: project.backgroundFolderPath || DEFAULT_PROJECT_STATE.backgroundFolderPath,
      selectedPlatform: project.selectedPlatform || DEFAULT_PROJECT_STATE.selectedPlatform,
      customSizePresets: cloneJson(project.customSizePresets || DEFAULT_PROJECT_STATE.customSizePresets),
      mockup: {
        ...DEFAULT_PROJECT_STATE.mockup,
        ...(project.mockup ? cloneJson(project.mockup) : {}),
      },
      scenes: cloneJson(project.scenes || DEFAULT_PROJECT_STATE.scenes),
      activeSceneId: project.activeSceneId ?? DEFAULT_PROJECT_STATE.activeSceneId,
      previewLanguage: project.previewLanguage || DEFAULT_PROJECT_STATE.previewLanguage,
      selectedElement: project.selectedElement || DEFAULT_PROJECT_STATE.selectedElement,
    },
  };
}
