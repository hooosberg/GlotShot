const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildUnsavedChangesDialogOptions,
  resolveUnsavedChangesAction,
} = require('../electron/windowCloseHelpers.cjs');

const T = (key, fallback) => ({
  unsavedChangesTitle: 'Unsaved Changes',
  saveBeforeClose: 'Save',
  dontSave: "Don't Save",
  cancelClose: 'Cancel',
}[key] || fallback);

test('resolveUnsavedChangesAction maps dialog button indexes to semantic actions', () => {
  assert.equal(resolveUnsavedChangesAction(0), 'save');
  assert.equal(resolveUnsavedChangesAction(1), 'discard');
  assert.equal(resolveUnsavedChangesAction(2), 'cancel');
  assert.equal(resolveUnsavedChangesAction(999), 'cancel');
});

test('buildUnsavedChangesDialogOptions builds a save-discard-cancel dialog with project context', () => {
  const dialogOptions = buildUnsavedChangesDialogOptions({
    T,
    projectName: 'Launch Campaign',
  });

  assert.deepEqual(dialogOptions.buttons, ['Save', "Don't Save", 'Cancel']);
  assert.equal(dialogOptions.defaultId, 0);
  assert.equal(dialogOptions.cancelId, 2);
  assert.match(dialogOptions.message, /Launch Campaign/);
  assert.equal(dialogOptions.title, 'Unsaved Changes');
});
