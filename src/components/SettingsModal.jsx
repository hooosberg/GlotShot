import { useState, useEffect } from 'react';
import { X, LayoutGrid, Monitor, Palette, Keyboard, Settings, Info, Image as ImageIcon, Layers, Github, ExternalLink } from 'lucide-react';
import './SettingsModal.css';
import { translations } from '../locales/translations';

const SettingsModal = ({ isOpen, onClose, initialTab = 'start', appMode, setAppMode, globalSettings, setGlobalSettings, theme, setTheme, glassEffect, setGlassEffect }) => {
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
        // { id: 'appearance', icon: Palette, label: t('settings.nav.appearance') }, // Removed as per request
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
                        <div className="content-section wide-section">
                            <h2 className="section-title">{t('settings.nav.start')}</h2>
                            <div className="mode-cards">
                                <div
                                    className={`mode-card ${appMode === 'screenshot' ? 'active' : ''}`}
                                    onClick={() => { setAppMode('screenshot'); onClose(); }}
                                >
                                    <div className="mode-card-header">
                                        <div className="mode-card-icon">
                                            <ImageIcon size={28} />
                                        </div>
                                        <div className="mode-card-title-group">
                                            <div className="mode-card-title">商店海报设计</div>
                                            <div className="mode-card-subtitle">Store Poster Design</div>
                                        </div>
                                    </div>
                                    <div className="mode-card-body">
                                        <p className="mode-card-desc">
                                            专为 App Store 和 Google Play 打造的截图美化工具。
                                        </p>
                                        <ul className="mode-features">
                                            <li>✨ 智能手机外壳套用</li>
                                            <li>🎨 渐变背景与文字排版</li>
                                            <li>🌍 多语言批量导出</li>
                                        </ul>
                                    </div>
                                    <div className="mode-card-footer">
                                        <span className="mode-cta">进入设计 &rarr;</span>
                                    </div>
                                </div>

                                <div
                                    className={`mode-card ${appMode === 'icon' ? 'active' : ''}`}
                                    onClick={() => { setAppMode('icon'); onClose(); }}
                                >
                                    <div className="mode-card-header">
                                        <div className="mode-card-icon">
                                            <Layers size={28} />
                                        </div>
                                        <div className="mode-card-title-group">
                                            <div className="mode-card-title">多平台图标工厂</div>
                                            <div className="mode-card-subtitle">Multi-platform Icon Factory</div>
                                        </div>
                                    </div>
                                    <div className="mode-card-body">
                                        <p className="mode-card-desc">
                                            一键生成所有主流平台所需的图标尺寸。
                                        </p>
                                        <ul className="mode-features">
                                            <li>📱 iOS / Android / Windows / Web</li>
                                            <li>✂️ 自动裁切与圆角处理</li>
                                            <li>🚀 快速批量导出</li>
                                        </ul>
                                    </div>
                                    <div className="mode-card-footer">
                                        <span className="mode-cta">进入工厂 &rarr;</span>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-intro-section">
                                <h3>关于 GlotShot</h3>
                                <p>
                                    GlotShot 是一个专注于移动应用上架素材设计的工具集。无论你是需要制作精美的应用商店预览图，还是需要生成适配各个平台的应用图标，GlotShot 都能帮助你高效完成。
                                </p>
                                <p>
                                    选择上方的一个模块开始你的工作。你可以在任何时候通过右上角的设置按钮切换回这里。
                                </p>
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
