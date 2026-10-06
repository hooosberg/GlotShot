function buildUnsavedChangesDialogOptions({ T, projectName }) {
  const resolvedProjectName = String(projectName || 'Untitled Project').trim() || 'Untitled Project';

  return {
    type: 'warning',
    buttons: [
      T('saveBeforeClose', 'Save'),
      T('dontSave', "Don't Save"),
      T('cancelClose', 'Cancel'),
    ],
    defaultId: 0,
    cancelId: 2,
    noLink: true,
    title: T('unsavedChangesTitle', 'Unsaved Changes'),
    message: T(
      'unsavedChangesMessage',
      `"${resolvedProjectName}" has unsaved changes.`
    ).replace('{name}', resolvedProjectName),
    detail: T(
      'unsavedChangesDetail',
      'Do you want to save before closing?'
    ),
  };
}

function resolveUnsavedChangesAction(responseIndex) {
  switch (responseIndex) {
    case 0:
      return 'save';
    case 1:
      return 'discard';
    default:
      return 'cancel';
  }
}

module.exports = {
  buildUnsavedChangesDialogOptions,
  resolveUnsavedChangesAction,
};
