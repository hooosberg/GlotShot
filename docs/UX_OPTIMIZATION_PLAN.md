# UX 优化方案：渐进式披露 + 画布交互 + 拖拽流畅度

## Context

当前应用有三个核心 UX 问题需要解决：
1. 右侧属性面板一次性展示所有控件，信息密度过高
2. 画布上无法直接交互选择元素
3. 通过滑块调整截图/文字位置时，每次 state 变化都触发 canvas 完整重绘（drawCanvas 包含图片加载、渐变计算等），导致明显卡顿
4. 截图和文字的默认初始尺寸不够合理

## 方案总览

| 优化项 | 方案 |
|--------|------|
| 渐进式披露 | 右侧面板分段标签，按选中元素条件渲染 |
| 背景设置 | 从左侧面板迁移到右侧面板的背景标签页 |
| 画布点击选择 | 坐标转换 + 命中检测，点击切换属性面板 |
| 拖拽流畅度 | 拖拽时只移动 DOM 控制框，松手后才更新 canvas |
| 默认尺寸 | 调整 DEFAULT_SCENE_SETTINGS 为更合理值 |

---

## 1. 渐进式披露 - 元素分段标签

### 1.1 新增选择状态

**文件**: `src/App.jsx` (~line 600)

```javascript
const [selectedElement, setSelectedElement] = useState('text'); // 'background' | 'text' | 'screenshot'
```

### 1.2 分段标签控件

在右侧面板的布局预设区域下方，添加三段式标签：

```jsx
{/* 元素选择标签 */}
<div className="px-5 py-3 border-b border-[var(--app-border)]">
  <div className="flex bg-[var(--app-input-bg)] rounded-lg p-1">
    {[
      { id: 'background', icon: ImageIcon, label: t('rightPanel.elementBackground') },
      { id: 'text', icon: Type, label: t('rightPanel.elementText') },
      { id: 'screenshot', icon: Monitor, label: t('rightPanel.elementScreenshot') },
    ].map(tab => (
      <button
        key={tab.id}
        onClick={() => setSelectedElement(tab.id)}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-medium transition ${
          selectedElement === tab.id
            ? 'bg-[var(--app-accent)] text-white shadow-sm'
            : 'text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]'
        }`}
      >
        <tab.icon className="w-3.5 h-3.5" />
        {tab.label}
      </button>
    ))}
  </div>
</div>
```

样式参考现有的文字对齐按钮组 (line 4242)。

### 1.3 右侧面板条件渲染

当前结构 (lines 4190-4596):
```
[布局预设]          → 始终显示
[文字设置]          → 始终显示
[截图+设备控件]     → 始终显示
```

新结构:
```
[布局预设]                    → 始终显示
[元素标签: 背景|文字|截图]     → 始终显示
[对应面板内容]                → 条件渲染 + animate-in fade-in 过渡
```

```jsx
{selectedElement === 'background' && (
  <div className="animate-in fade-in">
    {/* 背景设置 - 从左侧面板迁移来的内容 */}
  </div>
)}
{selectedElement === 'text' && (
  <div className="animate-in fade-in">
    {/* 现有文字设置 (lines 4229-4510) */}
  </div>
)}
{selectedElement === 'screenshot' && (
  <div className="animate-in fade-in">
    {/* 现有截图+设备控件 (lines 4512-4594) */}
  </div>
)}
```

---

## 2. 背景设置迁移到右侧面板

### 2.1 从左侧面板移出

**文件**: `src/App.jsx` (lines 3746-4048)

将完整的背景设置区域（色板选择、自定义渐变、内置背景图片、上传背景、背景变换控件）移到右侧面板的 `selectedElement === 'background'` 条件块中。

### 2.2 左侧面板保留紧凑指示器

左侧面板原背景区域替换为紧凑预览行：

```jsx
<button
  onClick={() => setSelectedElement('background')}
  className="w-full flex items-center gap-3 p-3 rounded-lg border border-[var(--app-border)] hover:bg-[var(--app-card-bg-hover)] transition"
>
  {/* 背景缩略预览 */}
  <div className="w-10 h-7 rounded border border-[var(--app-border)] overflow-hidden flex-shrink-0"
    style={{ background: currentBackgroundPreviewStyle }}
  />
  <span className="text-xs text-[var(--app-text-secondary)]">{t('sidebar.globalBackground')}</span>
  <ChevronRight className="w-3 h-3 ml-auto text-[var(--app-text-muted)]" />
</button>
```

左侧面板保留不变：场景列表 + Ollama 翻译设置。

---

## 3. 画布点击选择元素

### 3.1 元素边界计算

新增函数 `computeElementBounds(scene, globalSettings, previewLanguage)`，复用 drawCanvas 的位置计算逻辑：

```javascript
const computeElementBounds = useCallback((scene) => {
  if (!scene) return {};
  const { width, height } = globalSettings;
  const bounds = {};

  // 文字区域
  const resolvedLang = resolveCanvasLanguageCode(previewLanguage);
  const sceneStyle = getSceneLanguageStyle(scene, resolvedLang);
  const textY = sceneStyle.textY;
  const fontSize = sceneStyle.textSize;
  const text = getSceneTitleByLanguage(scene, resolvedLang);
  const lines = text ? text.split('\n').length : 1;
  const lineHeight = fontSize * 1.2;
  bounds.text = {
    x: width * 0.05,
    y: textY,
    width: width * 0.9,
    height: lineHeight * lines
  };

  // 截图区域
  if (scene.screenshot) {
    // 简化估算，不需要加载图片
    const scale = scene.settings.screenshotScale || 0.8;
    const ssX = scene.settings.screenshotX || 0;
    const ssY = scene.settings.screenshotY || 400;
    // 使用 16:9 估算截图比例
    const targetWidth = width * 0.6 * scale;
    const targetHeight = targetWidth * (9/16);
    bounds.screenshot = {
      x: (width - targetWidth) / 2 + ssX,
      y: ssY,
      width: targetWidth,
      height: targetHeight
    };
  }

  return bounds;
}, [globalSettings, previewLanguage]);
```

### 3.2 画布 onClick 处理器

在 canvas 容器 div (line 4172) 添加点击事件：

```jsx
<div className="relative ..."
  onClick={(e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = globalSettings.width / rect.width;
    const scaleY = globalSettings.height / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    const bounds = computeElementBounds(activeScene);
    const hitTest = (b) => b && canvasX >= b.x && canvasX <= b.x + b.width && canvasY >= b.y && canvasY <= b.y + b.height;

    // 检测顺序根据 textOnTop 决定
    if (globalSettings.textOnTop) {
      if (hitTest(bounds.text)) return setSelectedElement('text');
      if (hitTest(bounds.screenshot)) return setSelectedElement('screenshot');
    } else {
      if (hitTest(bounds.screenshot)) return setSelectedElement('screenshot');
      if (hitTest(bounds.text)) return setSelectedElement('text');
    }
    setSelectedElement('background');
  }}
>
```

### 3.3 选中元素视觉指示

在 canvas 容器内叠加绝对定位的 div，用虚线框标记选中区域：

```jsx
{selectedElement !== 'background' && (() => {
  const bounds = computeElementBounds(activeScene);
  const b = bounds[selectedElement];
  if (!b) return null;
  const { width: cw, height: ch } = globalSettings;
  return (
    <div
      className="absolute border-2 border-dashed border-blue-400/50 rounded-sm pointer-events-none transition-all duration-200"
      style={{
        left: `${(b.x / cw) * 100}%`,
        top: `${(b.y / ch) * 100}%`,
        width: `${(b.width / cw) * 100}%`,
        height: `${(b.height / ch) * 100}%`,
      }}
    />
  );
})()}
```

使用 `pointer-events-none` 确保点击穿透。百分比定位自动适应 canvas 缩放。不影响导出。

---

## 4. 拖拽流畅度优化 - 代理框方案

### 4.1 问题分析

当前渲染流程：
```
滑块拖动 → state 更新 → useEffect 触发 → requestAnimationFrame → drawCanvas()
```

`drawCanvas` 每次执行包含：
- 图片异步加载 (`loadImage` + `await`)
- 渐变计算
- 文字测量与绘制
- 阴影效果

即使有 rAF 节流，每帧仍然完整重绘，图片加载的 Promise 也增加延迟。

### 4.2 解决方案：DOM 代理框 + 延迟提交

**核心思路**: 拖拽滑块（或画布直接拖拽）时，不更新 canvas state，而是用 CSS transform 移动一个半透明的 DOM 代理框来预览位置。松手后才将最终位置写入 state，触发一次 canvas 重绘。

#### 4.2.1 新增拖拽状态

```javascript
// 拖拽中的临时偏移量，不触发 canvas 重绘
const [dragOffset, setDragOffset] = useState(null);
// dragOffset = { type: 'screenshot'|'text', deltaX: number, deltaY: number }
// null 表示未在拖拽
```

#### 4.2.2 代理框渲染

在 canvas 容器中叠加代理框，当 `dragOffset` 存在时显示：

```jsx
{dragOffset && (() => {
  const bounds = computeElementBounds(activeScene);
  const b = bounds[dragOffset.type];
  if (!b) return null;
  const { width: cw, height: ch } = globalSettings;

  // 将 canvas 坐标系的 delta 转换为百分比
  const offsetXPercent = (dragOffset.deltaX / cw) * 100;
  const offsetYPercent = (dragOffset.deltaY / ch) * 100;

  return (
    <div
      className="absolute border-2 border-solid border-blue-500/70 bg-blue-500/10 rounded-sm pointer-events-none"
      style={{
        left: `${(b.x / cw) * 100 + offsetXPercent}%`,
        top: `${(b.y / ch) * 100 + offsetYPercent}%`,
        width: `${(b.width / cw) * 100}%`,
        height: `${(b.height / ch) * 100}%`,
        transition: 'none', // 拖拽时不要过渡动画
      }}
    />
  );
})()}
```

#### 4.2.3 滑块改造 - 以截图 Y 轴为例

将滑块的 `onChange` 改为更新 dragOffset（不触发 canvas 重绘），`onMouseUp/onTouchEnd` 时提交最终值：

```jsx
// 截图 Y 位置滑块
<input
  type="range" min="-1000" max="1000" step="10"
  value={
    dragOffset?.type === 'screenshot'
      ? (activeScene.settings.screenshotY + dragOffset.deltaY)
      : activeScene.settings.screenshotY
  }
  onChange={(e) => {
    const newY = parseInt(e.target.value);
    const currentY = activeScene.settings.screenshotY;
    setDragOffset({
      type: 'screenshot',
      deltaX: dragOffset?.deltaX || 0,
      deltaY: newY - currentY
    });
  }}
  onMouseUp={(e) => {
    if (dragOffset) {
      // 提交最终值，触发一次 canvas 重绘
      updateSceneSettings('screenshotY', activeScene.settings.screenshotY + dragOffset.deltaY);
      if (dragOffset.deltaX) {
        updateSceneSettings('screenshotX', activeScene.settings.screenshotX + dragOffset.deltaX);
      }
      setDragOffset(null);
    }
  }}
  onTouchEnd={/* 同 onMouseUp */}
/>
```

同样应用于：
- `screenshotX` 滑块
- `screenshotScale` 滑块（此处代理框显示缩放后的大小）
- `textY` / `textSize` 滑块
- `backgroundX` / `backgroundY` / `backgroundScale` 滑块
- `deviceX` / `deviceY` / `deviceScale` 滑块

#### 4.2.4 画布直接拖拽（可选增强）

在选中元素的指示框上添加拖拽能力：

```jsx
<div
  className="absolute border-2 border-dashed border-blue-400/50 rounded-sm cursor-move"
  style={{ /* 同选中指示框 */ }}
  onPointerDown={(e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = globalSettings.width / rect.width;
    const scaleY = globalSettings.height / rect.height;

    const onMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startX) * scaleX;
      const dy = (moveEvent.clientY - startY) * scaleY;
      setDragOffset({ type: selectedElement, deltaX: dx, deltaY: dy });
    };

    const onUp = () => {
      // 提交拖拽结果
      if (dragOffset) {
        commitDragOffset(dragOffset);
      }
      setDragOffset(null);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }}
/>
```

`commitDragOffset` 函数根据 type 更新对应的 state：

```javascript
const commitDragOffset = (offset) => {
  if (offset.type === 'screenshot') {
    updateSceneSettings('screenshotX', activeScene.settings.screenshotX + offset.deltaX);
    updateSceneSettings('screenshotY', activeScene.settings.screenshotY + offset.deltaY);
  } else if (offset.type === 'text') {
    // 文字只有 Y 轴可调
    updateSceneLanguageStyle(activeScene.id, previewLanguage, {
      textY: previewSceneLanguageStyle.textY + offset.deltaY
    });
  }
};
```

---

## 5. 更合理的默认初始尺寸

**文件**: `src/App.jsx` (line 325)

```javascript
const DEFAULT_SCENE_SETTINGS = {
  screenshotScale: 0.85,  // 原 0.8，稍大
  screenshotY: 500,       // 原 400，给文字更多呼吸空间
  screenshotX: 0,         // 不变
  screenshotShadow: true,
  textYCN: 180,           // 原 150，向下微调
  textSizeCN: 110,        // 原 120，稍小更均衡
  textYEN: 180,           // 原 150
  textSizeEN: 90,         // 原 100，稍小
  deviceConfigs: {},
};
```

仅影响新创建的场景，已有数据从 localStorage 加载不受影响。

---

## 6. i18n 翻译

**文件**: `src/locales/translations.js`

在每种语言的 `rightPanel` 对象中添加：

| key | 中文 | 英文 |
|-----|------|------|
| `rightPanel.elementBackground` | 背景 | Background |
| `rightPanel.elementText` | 文字 | Text |
| `rightPanel.elementScreenshot` | 截图 | Screenshot |

---

## 关键文件清单

| 文件 | 修改内容 |
|------|---------|
| `src/App.jsx` | selectedElement/dragOffset state；元素标签控件；右侧面板条件渲染；背景控件迁移；左侧面板简化；canvas onClick+拖拽；选中/代理框 overlay；滑块改造；computeElementBounds；commitDragOffset；DEFAULT_SCENE_SETTINGS |
| `src/App.css` | 面板切换过渡动画样式（如需补充） |
| `src/locales/translations.js` | 新增 3 个翻译 key × 各语言 |

## 实施顺序

1. **阶段一**: 元素标签 + 条件渲染（最小可用版本）
2. **阶段二**: 背景设置迁移（左→右面板）
3. **阶段三**: 画布点击选择 + 选中指示框
4. **阶段四**: 拖拽流畅度优化（代理框 + 滑块改造）
5. **阶段五**: 画布直接拖拽（可选增强）
6. **阶段六**: 默认尺寸 + i18n + 收尾

## 验证方式

1. `npm run dev` 启动应用
2. 验证右侧面板标签切换正常，每个标签只显示对应属性
3. 验证点击画布上的文字/截图区域能切换标签
4. 验证背景设置已从左侧移到右侧面板
5. 拖拽滑块时验证代理框流畅移动，松手后 canvas 更新
6. 导入新截图，验证默认尺寸更合理
7. 验证导出功能不受选中指示/代理框影响
8. 验证切换预览语言时面板正确响应
