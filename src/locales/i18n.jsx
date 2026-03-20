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
 * @param {string} [lang] - 可选的语言代码，如果不传则使用 navigator.language
 */
export const detectSystemLanguage = (lang) => {
    try {
        const systemLang = lang || navigator.language || navigator.userLanguage;
        if (!systemLang) return 'en';

        // 1. 精确匹配 (Code match)
        const exactMatch = SUPPORTED_UI_LANGUAGES.find(l => l.code === systemLang);
        if (exactMatch) return exactMatch.code;

        // 2. 尝试匹配 Electron 的 app.getLocale() 返回的格式 (e.g., 'zh-CN')
        // 如果 systemLang 是 'zh'，也就是 navigator.language 可能返回的值
        if (systemLang === 'zh') return 'zh-CN';

        // 3.前缀匹配 (e.g. zh-Hans -> zh-CN, en-US -> en)
        const langPrefix = systemLang.split('-')[0];

        // 特殊处理中文：如果前缀是 zh，优先匹配 zh-CN
        if (langPrefix === 'zh') {
            // 检查是否有对应的中文变体
            const zhMatch = SUPPORTED_UI_LANGUAGES.find(l => l.code === 'zh-CN');
            if (zhMatch) return zhMatch.code;
        }

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

const getTranslationValue = (languageCode, key) => {
    const keys = key.split('.');
    let value = translations[languageCode];

    for (const k of keys) {
        value = value?.[k];
        if (value === undefined) break;
    }

    return value;
};

const interpolateTranslation = (value, params = {}) => {
    if (typeof value !== 'string' || !params || typeof params !== 'object') {
        return value;
    }

    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        const paramValue = params[paramKey];
        return paramValue === undefined || paramValue === null ? match : String(paramValue);
    });
};

const parseTranslationArgs = (optionsOrFallback, maybeFallback) => {
    if (
        optionsOrFallback
        && typeof optionsOrFallback === 'object'
        && !Array.isArray(optionsOrFallback)
    ) {
        return {
            params: optionsOrFallback,
            fallback: maybeFallback
        };
    }

    return {
        params: {},
        fallback: optionsOrFallback ?? maybeFallback
    };
};

const getFallbackLanguageOrder = (languageCode) => {
    if (languageCode === 'zh-TW') {
        return ['zh-CN', 'en'];
    }

    if (languageCode !== 'en') {
        return ['en', 'zh-CN'];
    }

    return ['zh-CN'];
};

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
        // 检测浏览器语言作为初始值
        return detectSystemLanguage();
    });

    // 初始化时从主进程获取准确的系统语言
    useEffect(() => {
        const initLanguage = async () => {
            // 如果用户已经手动设置了语言，或者传入了初始语言，则跳过
            if (initialLanguage && initialLanguage !== 'auto') return;
            const saved = localStorage.getItem('app_ui_language');
            if (saved && saved !== 'auto') return;

            // 获取 Electron 主进程的 locale (更准确)
            if (window.electron?.getAppLocale) {
                try {
                    const appLocale = await window.electron.getAppLocale();
                    console.log('App Locale:', appLocale);
                    if (appLocale) {
                        const detected = detectSystemLanguage(appLocale);
                        // 如果检测到的语言与当前不同，则更新
                        if (detected !== language) {
                            setLanguage(detected);
                        }
                    }
                } catch (e) {
                    console.error('Failed to get app locale:', e);
                }
            }
        };

        initLanguage();
    }, []);

    // 监听语言变化，更新菜单
    useEffect(() => {
        if (window.electron?.updateMenuLanguage) {
            // 获取当前语言的完整翻译对象
            const currentTrans = translations[language] || translations['zh-CN'];
            // 优先使用当前语言的菜单，如果没有则回退到英文菜单 (避免显示默认的中文)
            const menuSource = currentTrans.menu || translations['en'].menu || translations['zh-CN'].menu;

            // 由于 we standardized on Flat structure in translations.js, we can pass it directly
            const menuLabels = menuSource;

            window.electron.updateMenuLanguage(menuLabels);
        }
    }, [language]);

    // 更新语言设置
    const changeLanguage = useCallback((newLang) => {
        const actualLang = newLang === 'auto' ? detectSystemLanguage() : newLang;
        setLanguage(actualLang);
        try {
            localStorage.setItem('app_ui_language', newLang);
        } catch { }
    }, []);

    // 翻译函数
    const t = useCallback((key, optionsOrFallback, maybeFallback) => {
        const { params, fallback } = parseTranslationArgs(optionsOrFallback, maybeFallback);
        let value = getTranslationValue(language, key);

        if (value === undefined) {
            const fallbackLanguages = getFallbackLanguageOrder(language);

            for (const fallbackLanguage of fallbackLanguages) {
                value = getTranslationValue(fallbackLanguage, key);
                if (value !== undefined) {
                    break;
                }
            }
        }

        // 最终回退到 fallback 或 key
        return interpolateTranslation(value ?? fallback ?? key, params);
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
            t: (key, optionsOrFallback, maybeFallback) => {
                const { params, fallback } = parseTranslationArgs(optionsOrFallback, maybeFallback);
                const value = getTranslationValue('zh-CN', key);
                return interpolateTranslation(value ?? fallback ?? key, params);
            },
            supportedLanguages: SUPPORTED_UI_LANGUAGES
        };
    }
    return context;
};

export default { I18nProvider, useTranslation, detectSystemLanguage, SUPPORTED_UI_LANGUAGES };
