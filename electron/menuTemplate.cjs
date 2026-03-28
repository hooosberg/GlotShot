function buildMenuTemplate({ isMac, T, handlers }) {
  return [
    ...(isMac ? [{
      label: handlers.appName || 'GlotShot',
      submenu: [
        { label: T('about', '关于 GlotShot'), click: handlers.onAbout },
        { type: 'separator' },
        { label: T('settings', '设置...'), accelerator: 'CmdOrCtrl+,', click: handlers.onSettings },
        { type: 'separator' },
        { role: 'services', label: T('services', '服务') },
        { type: 'separator' },
        { role: 'hide', label: T('hide', '隐藏 GlotShot') },
        { role: 'hideOthers', label: T('hideOthers', '隐藏其他') },
        { role: 'unhide', label: T('showAll', '显示全部') },
        { type: 'separator' },
        { role: 'quit', label: T('quit', '退出 GlotShot') }
      ]
    }] : []),
    {
      label: T('file', '文件'),
      submenu: [
        { label: T('newFile', '新建文件'), accelerator: 'CmdOrCtrl+N', click: handlers.onNewFile },
        { label: T('openProject', '导入源文件...'), accelerator: 'CmdOrCtrl+O', click: handlers.onOpenProject },
        { label: T('saveProject', '保存源文件'), accelerator: 'CmdOrCtrl+S', click: handlers.onSaveProject },
        { label: T('saveProjectAs', '另存为...'), accelerator: 'CmdOrCtrl+Shift+S', click: handlers.onSaveProjectAs },
        { type: 'separator' },
        { label: T('newWindow', '新建窗口'), accelerator: 'CmdOrCtrl+Shift+N', click: handlers.onNewWindow },
        { label: T('importScreenshots', '导入截图...'), accelerator: 'CmdOrCtrl+I', click: handlers.onImportScreenshots },
        {
          label: T('export', '导出'),
          submenu: [
            { label: T('exportByLanguage', '按语言导出...'), accelerator: 'CmdOrCtrl+E', click: handlers.onExportByLanguage },
            { label: T('exportByDevice', '按设备导出...'), accelerator: 'CmdOrCtrl+Shift+E', click: handlers.onExportByDevice }
          ]
        },
        { type: 'separator' },
        isMac ? { role: 'close', label: T('close', '关闭窗口') } : { role: 'quit', label: T('quit', '退出') }
      ]
    },
    {
      label: T('edit', '编辑'),
      submenu: [
        { role: 'undo', label: T('undo', '撤销') },
        { role: 'redo', label: T('redo', '重做') },
        { type: 'separator' },
        { role: 'cut', label: T('cut', '剪切') },
        { role: 'copy', label: T('copy', '复制') },
        { role: 'paste', label: T('paste', '粘贴') },
        { role: 'delete', label: T('delete', '删除') },
        { role: 'selectAll', label: T('selectAll', '全选') },
        { type: 'separator' },
        { label: T('startSpeaking', '语音听写'), role: 'startSpeaking' },
        { label: T('stopSpeaking', '停止朗读'), role: 'stopSpeaking' }
      ]
    },
    {
      label: T('view', '视图'),
      submenu: [
        { role: 'reload', label: T('reload', '重新加载') },
        { role: 'forceReload', label: T('forceReload', '强制重新加载') },
        { role: 'toggleDevTools', label: T('toggleDevTools', '切换开发者工具') },
        { type: 'separator' },
        { role: 'resetZoom', label: T('resetZoom', '重置缩放') },
        { role: 'zoomIn', label: T('zoomIn', '放大') },
        { role: 'zoomOut', label: T('zoomOut', '缩小') },
        { type: 'separator' },
        { role: 'togglefullscreen', label: T('toggleFullscreen', '切换全屏') }
      ]
    },
    {
      label: T('mode', '模式'),
      submenu: [
        { label: T('posterDesign', '海报设计 (Poster Design)'), accelerator: 'CmdOrCtrl+1', click: handlers.onModeScreenshot },
        { label: T('iconDesign', '图标设计 (Icon Design)'), accelerator: 'CmdOrCtrl+2', click: handlers.onModeIcon }
      ]
    },
    {
      label: T('window', '窗口'),
      submenu: [
        { label: T('showMainWindow', '显示主窗口'), click: handlers.onShowMainWindow },
        { type: 'separator' },
        { role: 'minimize', label: T('minimize', '最小化') },
        { role: 'zoom', label: T('zoom', '缩放') },
        { type: 'separator' },
        { role: 'front', label: T('front', '前置全部窗口') },
        { type: 'separator' },
        { role: 'window', label: T('window', '窗口') }
      ]
    },
    {
      role: 'help',
      label: T('help', '帮助'),
      submenu: [
        { label: T('visitWebsite', '访问官网首页'), click: handlers.onVisitWebsite },
        { label: T('visitGithub', '访问 GitHub 仓库'), click: handlers.onVisitGithub },
        { type: 'separator' },
        { label: T('aboutDeveloper', '关于开发者 (hooosberg)'), click: handlers.onAboutDeveloper }
      ]
    }
  ];
}

function buildDockMenuTemplate({ T, handlers }) {
  return [
    { label: T('newWindow', '新建窗口'), click: handlers.onNewWindow }
  ];
}

module.exports = {
  buildMenuTemplate,
  buildDockMenuTemplate,
};

