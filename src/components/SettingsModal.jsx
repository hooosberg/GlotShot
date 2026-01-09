import { useState, useEffect } from 'react';
import { X, LayoutGrid, Monitor, Palette, Keyboard, Settings, Info, Image as ImageIcon, Layers, Github, ExternalLink } from 'lucide-react';
import './SettingsModal.css';
import { translations } from '../locales/translations';

const SettingsModal = ({ isOpen, onClose, initialTab = 'start', appMode, setAppMode, globalSettings, setGlobalSettings, theme, setTheme }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    // Determine language based on globalSettings.uiLanguage
    const lang = globalSettings?.uiLanguage || 'zh-CN';
    const t = (key) => {
        const keys = key.split('.');
        let value = translations[lang] || translations['zh-CN'];
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };

    // Reset tab when opening
    useEffect(() => {
        if (isOpen) setActiveTab(initialTab);
    }, [isOpen, initialTab]);

    if (!isOpen) return null;

    const sections = [
        { id: 'start', icon: LayoutGrid, label: t('settings.nav.start') },
        { id: 'appearance', icon: Palette, label: t('settings.nav.appearance') },
        { id: 'shortcuts', icon: Keyboard, label: t('settings.nav.shortcuts') },
        { id: 'general', icon: Settings, label: t('settings.nav.general') },
        { id: 'about', icon: Info, label: t('settings.nav.about') },
    ];

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>

                {/* Sidebar */}
                <div className="settings-sidebar">
                    <div className="sidebar-title">
                        <Settings className="w-5 h-5 text-indigo-500" />
                        {t('settings.title')}
                    </div>
                    {sections.map(section => (
                        <button
                            key={section.id}
                            className={`sidebar-item ${activeTab === section.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(section.id)}
                        >
                            <section.icon size={18} />
                            {section.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="settings-content">
                    <button className="settings-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>

                    {/* START (Modes) */}
                    {activeTab === 'start' && (
                        <div className="content-section">
                            <h2 className="section-title">{t('settings.nav.start')}</h2>
                            <div className="mode-cards">
                                <div
                                    className={`mode-card ${appMode === 'screenshot' ? 'active' : ''}`}
                                    onClick={() => { setAppMode('screenshot'); onClose(); }}
                                >
                                    <div className="mode-card-icon">
                                        <ImageIcon size={32} />
                                    </div>
                                    <div>
                                        <div className="mode-card-title">{t('settings.modes.poster_title')}</div>
                                        <div className="mode-card-desc">{t('settings.modes.poster_desc')}</div>
                                    </div>
                                </div>
                                <div
                                    className={`mode-card ${appMode === 'icon' ? 'active' : ''}`}
                                    onClick={() => { setAppMode('icon'); onClose(); }}
                                >
                                    <div className="mode-card-icon">
                                        <Layers size={32} />
                                    </div>
                                    <div>
                                        <div className="mode-card-title">{t('settings.modes.icon_title')}</div>
                                        <div className="mode-card-desc">{t('settings.modes.icon_desc')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* APPEARANCE */}
                    {activeTab === 'appearance' && (
                        <div className="content-section">
                            <h2 className="section-title">{t('settings.nav.appearance')}</h2>

                            <div className="form-group">
                                <label className="form-label">{t('settings.appearance.theme_title')}</label>
                                <div className="theme-options">
                                    <div
                                        className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                                        onClick={() => setTheme('dark')}
                                    >
                                        <div className="w-4 h-4 rounded-full bg-gray-900 border border-gray-600"></div>
                                        {t('settings.appearance.dark')}
                                    </div>
                                    <div
                                        className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                                        onClick={() => setTheme('light')}
                                    >
                                        <div className="w-4 h-4 rounded-full bg-white border border-gray-300"></div>
                                        {t('settings.appearance.light')}
                                    </div>
                                </div>
                            </div>

                            {/* Glassmorphism Placebo Toggle (for now just UI, can be hooked to CSS variable later) */}
                            <div className="toggle-group">
                                <div>
                                    <div className="toggle-label">{t('settings.appearance.glass_effect')}</div>
                                    <div className="form-help">{t('settings.appearance.glass_desc')}</div>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked={true} />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* SHORTCUTS */}
                    {activeTab === 'shortcuts' && (
                        <div className="content-section">
                            <h2 className="section-title">{t('settings.shortcuts.title')}</h2>
                            <div className="shortcuts-list">
                                {[
                                    { name: t('settings.shortcuts.save'), keys: ['⌘', 'S'] },
                                    { name: t('settings.shortcuts.import'), keys: ['⌘', 'I'] },
                                    { name: t('settings.shortcuts.settings'), keys: ['⌘', ','] },
                                    { name: t('settings.shortcuts.copy'), keys: ['⌘', 'C'] },
                                    { name: t('settings.shortcuts.paste'), keys: ['⌘', 'V'] },
                                    { name: t('settings.shortcuts.undo'), keys: ['⌘', 'Z'] },
                                ].map((item, i) => (
                                    <div className="shortcut-item" key={i}>
                                        <span className="shortcut-name">{item.name}</span>
                                        <span className="shortcut-keys">
                                            {item.keys.map(k => <kbd key={k}>{k}</kbd>)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* GENERAL */}
                    {activeTab === 'general' && (
                        <div className="content-section">
                            <h2 className="section-title">{t('settings.nav.general')}</h2>

                            {/* Language */}
                            <div className="form-group">
                                <label className="form-label">{t('settings.general.language_title')}</label>
                                <select
                                    className="form-select"
                                    value={globalSettings.uiLanguage}
                                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, uiLanguage: e.target.value }))}
                                >
                                    <option value="zh-CN">简体中文 (Simplified Chinese)</option>
                                    <option value="en">English (English)</option>
                                </select>
                            </div>

                            {/* Ollama */}
                            <div className="form-group">
                                <label className="form-label">{t('settings.general.ollama_title')}</label>
                                <input
                                    type="text"
                                    className="form-input mb-2"
                                    placeholder="http://localhost:11434"
                                    value={globalSettings.ollamaHost || ''}
                                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, ollamaHost: e.target.value }))}
                                />
                                <div className="toggle-group" style={{ background: 'transparent', padding: '8px 0', border: 'none' }}>
                                    <div className="toggle-label">{t('settings.general.auto_translate')}</div>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={globalSettings.autoTranslate}
                                            onChange={(e) => setGlobalSettings(prev => ({ ...prev, autoTranslate: e.target.checked }))}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>

                            {/* Export Path */}
                            <div className="form-group">
                                <label className="form-label">{t('settings.general.export_path')}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder={t('settings.general.export_placeholder')}
                                    value={globalSettings.saveLocation || ''}
                                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, saveLocation: e.target.value }))}
                                />
                            </div>
                        </div>
                    )}

                    {/* ABOUT */}
                    {activeTab === 'about' && (
                        <div className="content-section">
                            <div className="about-hero">
                                <div className="about-logo-large">
                                    <Monitor size={48} />
                                </div>
                                <div className="about-app-name">GlotShot</div>
                                <div className="about-app-desc">{t('settings.about.description')}</div>
                            </div>

                            <div className="about-meta">
                                <div className="meta-row">
                                    <span className="meta-label">{t('settings.about.version')}</span>
                                    <span className="meta-value">v1.3.3</span>
                                </div>
                                <div className="meta-row">
                                    <span className="meta-label">{t('settings.about.developer')}</span>
                                    <span className="meta-value">hooosberg</span>
                                </div>
                                <div className="meta-row">
                                    <span className="meta-label">Email</span>
                                    <span className="meta-value">zikedece@proton.me</span>
                                </div>
                                <div className="meta-row">
                                    <span className="meta-label">GitHub</span>
                                    <span className="meta-value">
                                        <a href="#" onClick={(e) => { e.preventDefault(); window.open('https://github.com/hooosberg/GlotShot', '_blank'); }}>
                                            github.com/hooosberg/GlotShot
                                        </a>
                                    </span>
                                </div>
                            </div>

                            <div className="star-cta" onClick={() => window.open('https://github.com/hooosberg/GlotShot', '_blank')}>
                                <div>{t('settings.about.star_title')}</div>
                                <div className="text-sm opacity-80 mt-1">{t('settings.about.star_action')}</div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
