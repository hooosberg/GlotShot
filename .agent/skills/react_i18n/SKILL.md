---
name: React i18n System
description: React 国际化系统模板，提供 Context + Hook 模式的多语言支持
---

# React i18n 国际化系统模板

基于 GlotShot 项目积累的经验，提供可复用的 React 国际化解决方案。

## 目录结构

```
src/
└── locales/
    ├── i18n.jsx          # Provider 和 Hook
    └── translations.js   # 翻译文件
```

## 核心代码模板

### 1. i18n.jsx (Provider + Hook)

```jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { translations } from './translations';

// 支持的语言列表
export const SUPPORTED_LANGUAGES = [
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    // 根据需求添加更多语言...
];

// 检测系统语言
export const detectSystemLanguage = () => {
    try {
        const systemLang = navigator.language || navigator.userLanguage;
        
        // 精确匹配
        const exactMatch = SUPPORTED_LANGUAGES.find(l => l.code === systemLang);
        if (exactMatch) return exactMatch.code;
        
        // 前缀匹配
        const langPrefix = systemLang.split('-')[0];
        const prefixMatch = SUPPORTED_LANGUAGES.find(l => l.code.startsWith(langPrefix));
        if (prefixMatch) return prefixMatch.code;
        
        return 'en'; // 默认英文
    } catch {
        return 'en';
    }
};

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        try {
            const saved = localStorage.getItem('app_language');
            if (saved) return saved;
        } catch {}
        return detectSystemLanguage();
    });

    const changeLanguage = useCallback((newLang) => {
        const actualLang = newLang === 'auto' ? detectSystemLanguage() : newLang;
        setLanguage(actualLang);
        try {
            localStorage.setItem('app_language', newLang);
        } catch {}
    }, []);

    // 翻译函数：支持点号分隔的嵌套 key
    const t = useCallback((key, fallback) => {
        const keys = key.split('.');
        let value = translations[language] || translations['en'];

        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break;
        }

        // 回退到默认语言
        if (value === undefined && language !== 'en') {
            value = translations['en'];
            for (const k of keys) {
                value = value?.[k];
                if (value === undefined) break;
            }
        }

        return value ?? fallback ?? key;
    }, [language]);

    return (
        <I18nContext.Provider value={{ language, changeLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(I18nContext);
    if (!context) {
        // 兜底实现
        return {
            language: 'en',
            changeLanguage: () => {},
            t: (key, fallback) => fallback ?? key,
            supportedLanguages: SUPPORTED_LANGUAGES
        };
    }
    return context;
};
```

### 2. translations.js (翻译文件)

```javascript
export const translations = {
    'en': {
        common: {
            cancel: 'Cancel',
            save: 'Save',
            delete: 'Delete',
            confirm: 'Confirm',
        },
        header: {
            title: 'My App',
            settings: 'Settings',
        },
        // 按功能模块组织...
    },
    'zh-CN': {
        common: {
            cancel: '取消',
            save: '保存',
            delete: '删除',
            confirm: '确认',
        },
        header: {
            title: '我的应用',
            settings: '设置',
        },
    },
};
```

## 使用方式

### 1. 在 App 中包裹 Provider

```jsx
import { I18nProvider } from './locales/i18n';

function App() {
    return (
        <I18nProvider>
            <YourApp />
        </I18nProvider>
    );
}
```

### 2. 在组件中使用

```jsx
import { useTranslation } from '../locales/i18n';

function Header() {
    const { t, language, changeLanguage, supportedLanguages } = useTranslation();
    
    return (
        <header>
            <h1>{t('header.title')}</h1>
            <select 
                value={language} 
                onChange={(e) => changeLanguage(e.target.value)}
            >
                {supportedLanguages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                    </option>
                ))}
            </select>
        </header>
    );
}
```

## 最佳实践

1. **按功能模块组织翻译 key**：如 `header.title`、`sidebar.menu.home`
2. **提供 fallback**：`t('key', 'Default Text')`
3. **先完成主语言**：建议先完成中文或英文，再扩展其他语言
4. **使用语义化 key**：避免 `text1`、`button2` 这样的命名
