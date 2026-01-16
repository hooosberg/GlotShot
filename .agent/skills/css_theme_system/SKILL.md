---
name: CSS Theme System
description: CSS 变量主题系统模板，支持 Dark/Light/Sepia 多主题切换
---

# CSS 主题系统模板

基于 GlotShot 项目积累的经验，提供可复用的 CSS 变量主题切换方案。

## 核心架构

使用 CSS 变量 + `data-theme` 属性实现主题切换。

## 代码模板

### index.css (主题定义)

```css
/* ============================================
   全局主题系统
   支持三种主题模式: dark (默认), light, sepia
   ============================================ */

/* 深色模式（默认） */
:root,
[data-theme="dark"] {
  /* 主背景色 */
  --app-bg-primary: #020617;
  --app-bg-secondary: #0f172a;
  --app-bg-tertiary: #1e293b;
  --app-bg-elevated: #334155;

  /* 文字颜色 */
  --app-text-primary: #ffffff;
  --app-text-secondary: rgba(255, 255, 255, 0.7);
  --app-text-muted: rgba(255, 255, 255, 0.4);

  /* 边框颜色 */
  --app-border: rgba(255, 255, 255, 0.1);
  --app-border-strong: rgba(255, 255, 255, 0.2);

  /* 卡片背景 */
  --app-card-bg: rgba(30, 41, 59, 0.5);
  --app-card-bg-hover: rgba(51, 65, 85, 0.5);

  /* 强调色 */
  --app-accent: #3b82f6;
  --app-accent-hover: #2563eb;
  --app-accent-light: rgba(59, 130, 246, 0.2);

  /* 功能色 */
  --app-success: #22c55e;
  --app-warning: #f59e0b;
  --app-danger: #ef4444;

  /* 控件 */
  --app-control-track: #334155;
  --app-input-bg: rgba(15, 23, 42, 0.8);
  --app-input-border: rgba(255, 255, 255, 0.1);
}

/* 浅色模式 */
[data-theme="light"] {
  --app-bg-primary: #ffffff;
  --app-bg-secondary: #f8fafc;
  --app-bg-tertiary: #f1f5f9;
  --app-bg-elevated: #e2e8f0;

  --app-text-primary: #0f172a;
  --app-text-secondary: rgba(15, 23, 42, 0.8);
  --app-text-muted: rgba(15, 23, 42, 0.5);

  --app-border: rgba(15, 23, 42, 0.1);
  --app-border-strong: rgba(15, 23, 42, 0.2);

  --app-card-bg: rgba(241, 245, 249, 0.8);
  --app-card-bg-hover: rgba(226, 232, 240, 0.8);

  --app-accent: #2563eb;
  --app-accent-hover: #1d4ed8;
  --app-accent-light: rgba(37, 99, 235, 0.15);

  --app-control-track: #cbd5e1;
  --app-input-bg: rgba(255, 255, 255, 0.9);
  --app-input-border: rgba(15, 23, 42, 0.15);
}

/* 茶色模式 (Sepia) */
[data-theme="sepia"] {
  --app-bg-primary: #f5ede4;
  --app-bg-secondary: #e6dccf;
  --app-bg-tertiary: #ede4d8;
  --app-bg-elevated: #e0d5c7;

  --app-text-primary: #3d2e1e;
  --app-text-secondary: rgba(61, 46, 30, 0.85);
  --app-text-muted: rgba(61, 46, 30, 0.55);

  --app-border: rgba(61, 46, 30, 0.12);
  --app-border-strong: rgba(61, 46, 30, 0.22);

  --app-card-bg: rgba(237, 228, 216, 0.7);
  --app-card-bg-hover: rgba(224, 213, 199, 0.8);

  --app-accent: #a16207;
  --app-accent-hover: #854d0e;
  --app-accent-light: rgba(161, 98, 7, 0.15);

  --app-control-track: rgba(161, 98, 7, 0.3);
  --app-input-bg: rgba(250, 246, 241, 0.9);
  --app-input-border: rgba(61, 46, 30, 0.15);
}

/* 基础样式 */
body {
  margin: 0;
  background-color: var(--app-bg-primary);
  color: var(--app-text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### React 主题切换 Hook

```jsx
import { useState, useEffect, useCallback } from 'react';

const THEMES = ['dark', 'light', 'sepia'];

export const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('app_theme') || 'dark';
        } catch {
            return 'dark';
        }
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const changeTheme = useCallback((newTheme) => {
        if (THEMES.includes(newTheme)) {
            setTheme(newTheme);
            try {
                localStorage.setItem('app_theme', newTheme);
            } catch {}
        }
    }, []);

    return { theme, changeTheme, themes: THEMES };
};
```

## 使用方式

### 1. 在组件中使用主题变量

```jsx
// 使用 Tailwind 语法
<div className="bg-[var(--app-bg-secondary)] text-[var(--app-text-primary)]">
    <h1 className="text-[var(--app-accent)]">标题</h1>
</div>
```

### 2. 主题切换器组件

```jsx
function ThemeSwitcher() {
    const { theme, changeTheme, themes } = useTheme();
    
    return (
        <div className="flex gap-2">
            {themes.map(t => (
                <button
                    key={t}
                    onClick={() => changeTheme(t)}
                    className={theme === t ? 'active' : ''}
                >
                    {t}
                </button>
            ))}
        </div>
    );
}
```

## 最佳实践

1. **使用语义化变量名**：`--app-text-primary` 而非 `--color-1`
2. **避免硬编码颜色**：使用 `text-[var(--app-text-secondary)]` 而非 `text-gray-400`
3. **提供平滑过渡**：在 body 上添加 `transition` 实现主题切换动画
4. **考虑对比度**：确保文字在所有主题下都可读
