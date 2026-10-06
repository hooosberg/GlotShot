const test = require('node:test');
const assert = require('node:assert/strict');

const { buildMenuTemplate, buildDockMenuTemplate } = require('../electron/menuTemplate.cjs');

const T = (key, fallback) => fallback;

test('file menu contains source-file actions before window and import/export actions', () => {
  const template = buildMenuTemplate({
    isMac: true,
    T,
    handlers: {},
  });

  const fileMenu = template.find((item) => item.label === '文件');
  assert.ok(fileMenu, 'expected file menu to exist');

  const labels = fileMenu.submenu
    .filter((item) => item && item.type !== 'separator')
    .map((item) => item.label);

  assert.deepEqual(
    labels.slice(0, 6),
    ['新建文件', '导入源文件...', '保存源文件', '另存为...', '新建窗口', '导入截图...']
  );
});

test('dock menu exposes new window on macOS', () => {
  const dockTemplate = buildDockMenuTemplate({
    T,
    handlers: {},
  });

  assert.deepEqual(dockTemplate.map((item) => item.label), ['新建窗口']);
});

