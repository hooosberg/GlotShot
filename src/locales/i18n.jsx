import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { translations } from './translations';

// 支持的12种语言
export const SUPPORTED_UI_LANGUAGES = [
    { code: 'zh-CN', name: '简体中文', nativeName: '简体中文', flag: '🇨🇳' },
    { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文', flag: '🌐' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'it', name: 'Italiano', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'العربية', nativeName: 'العربية', flag: '🇸🇦' },
];

/**
 * 检测系统语言并匹配到支持的语言
 */
export const detectSystemLanguage = () => {
    try {
        const systemLang = navigator.language || navigator.userLanguage;

        // 精确匹配
        const exactMatch = SUPPORTED_UI_LANGUAGES.find(l => l.code === systemLang);
        if (exactMatch) return exactMatch.code;

        // 前缀匹配 (如 zh-Hans -> zh-CN)
        const langPrefix = systemLang.split('-')[0];
        const prefixMatch = SUPPORTED_UI_LANGUAGES.find(l => l.code.startsWith(langPrefix));
        if (prefixMatch) return prefixMatch.code;

        // 默认返回英文
        return 'en';
    } catch {
        return 'en';
    }
};

// i18n Context
const I18nContext = createContext(null);

/**
 * i18n Provider 组件
 * 包裹应用以提供翻译功能
 */
export const I18nProvider = ({ children, initialLanguage }) => {
    const [language, setLanguage] = useState(() => {
        // 优先使用传入的初始语言
        if (initialLanguage && initialLanguage !== 'auto') {
            return initialLanguage;
        }
        // 尝试从 localStorage 读取
        try {
            const saved = localStorage.getItem('app_ui_language');
            if (saved && saved !== 'auto') {
                return saved;
            }
        } catch { }
        // 检测系统语言
        return detectSystemLanguage();
    });

    // 更新语言设置
    const changeLanguage = useCallback((newLang) => {
        const actualLang = newLang === 'auto' ? detectSystemLanguage() : newLang;
        setLanguage(actualLang);
        try {
            localStorage.setItem('app_ui_language', newLang);
        } catch { }

        // 通知 Electron 更新菜单语言（如果可用）
        if (window.electron?.updateMenuLanguage) {
            window.electron.updateMenuLanguage(actualLang);
        }
    }, []);

    // 翻译函数
    const t = useCallback((key, fallback) => {
        const keys = key.split('.');
        let value = translations[language] || translations['zh-CN'];

        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break;
        }

        // 如果找不到翻译，尝试使用中文作为回退
        if (value === undefined && language !== 'zh-CN') {
            value = translations['zh-CN'];
            for (const k of keys) {
                value = value?.[k];
                if (value === undefined) break;
            }
        }

        // 最终回退到 fallback 或 key
        return value ?? fallback ?? key;
    }, [language]);

    return (
        <I18nContext.Provider value={{ language, changeLanguage, t, supportedLanguages: SUPPORTED_UI_LANGUAGES }}>
            {children}
        </I18nContext.Provider>
    );
};

/**
 * 获取翻译功能的 Hook
 * @returns {{ language: string, changeLanguage: (lang: string) => void, t: (key: string, fallback?: string) => string }}
 */
export const useTranslation = () => {
    const context = useContext(I18nContext);
    if (!context) {
        // 如果没有 Provider，返回默认实现
        return {
            language: 'zh-CN',
            changeLanguage: () => { },
            t: (key, fallback) => {
                const keys = key.split('.');
                let value = translations['zh-CN'];
                for (const k of keys) {
                    value = value?.[k];
                    if (value === undefined) break;
                }
                return value ?? fallback ?? key;
            },
            supportedLanguages: SUPPORTED_UI_LANGUAGES
        };
    }
    return context;
};

export default { I18nProvider, useTranslation, detectSystemLanguage, SUPPORTED_UI_LANGUAGES };
