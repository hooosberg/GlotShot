import { useState, useEffect } from 'react';
import { X, LayoutGrid, Monitor, Palette, Keyboard, Settings, Info, Image as ImageIcon, Layers, Github, ExternalLink, Star, Sun, Moon, Coffee, Crown, Check } from 'lucide-react';
import './SettingsModal.css';
import { useTranslation, SUPPORTED_UI_LANGUAGES, detectSystemLanguage } from '../locales/i18n';
import { LicenseManager } from '../services/LicenseManager';

const appLogo = '/icon/DMG_Icon_1024x1024.png';
const LICENSE_BENEFIT_ITEMS = [
    { titleKey: 'paywall.benefitTranslationTitle', descKey: 'paywall.benefitTranslationDesc' },
    { titleKey: 'paywall.benefitBatchTitle', descKey: 'paywall.benefitBatchDesc' },
    { titleKey: 'paywall.benefitTimeTitle', descKey: 'paywall.benefitTimeDesc' },
    { titleKey: 'paywall.benefitFutureTitle', descKey: 'paywall.benefitFutureDesc' },
];

const SettingsModal = ({ isOpen, onClose, initialTab = 'start', appMode, setAppMode, globalSettings, setGlobalSettings, theme, setTheme, glassEffect, setGlassEffect }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [licenseState, setLicenseState] = useState(() => LicenseManager.getState());
    const [licenseActionBusy, setLicenseActionBusy] = useState('idle');
    const [licenseActionFeedback, setLicenseActionFeedback] = useState(null);
    const { t, changeLanguage } = useTranslation();

    // 处理语言变更
    const handleLanguageChange = (newLang) => {
        setGlobalSettings(prev => ({ ...prev, uiLanguage: newLang }));
        changeLanguage(newLang);
    };

    // Reset tab when opening
    useEffect(() => {
        if (isOpen) setActiveTab(initialTab);
    }, [isOpen, initialTab]);

    useEffect(() => {
        if (!isOpen) {
            setLicenseActionBusy('idle');
            setLicenseActionFeedback(null);
            return;
        }

        let isMounted = true;

        LicenseManager.initialize().then((state) => {
            if (isMounted) {
                setLicenseState({ isPro: Boolean(state?.isPro) });
            }
        });

        const unsubscribe = LicenseManager.onChange((state) => {
            setLicenseState({ isPro: Boolean(state?.isPro) });
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sections = [
        { id: 'start', icon: LayoutGrid, label: t('settings.nav.start') },
        { id: 'shortcuts', icon: Keyboard, label: t('settings.nav.shortcuts') },
        { id: 'general', icon: Settings, label: t('settings.nav.general') },
        { id: 'about', icon: Info, label: t('settings.nav.about') },
        { id: 'license', icon: Crown, label: t('settings.nav.license') },
    ];

    const withLicenseActionDetail = (message, result) => {
        if (!result?.message) {
            return message;
        }

        return `${message} ${result.message}`;
    };

    const getLicenseActionMessage = (result, action) => {
        if (action === 'restore' && result.status === 'not_found') {
            return t('paywall.restoreNotFound');
        }

        if (result.status === 'cancelled') {
            return t('paywall.purchaseCancelled');
        }

        if (result.status === 'not_supported') {
            return action === 'purchase'
                ? withLicenseActionDetail(t('paywall.purchaseNotSupported'), result)
                : withLicenseActionDetail(t('paywall.restoreNotSupported'), result);
        }

        return action === 'purchase'
            ? withLicenseActionDetail(t('paywall.purchaseFailed'), result)
            : withLicenseActionDetail(t('paywall.restoreFailed'), result);
    };

    const handleLicensePurchase = async () => {
        setLicenseActionBusy('purchase');
        setLicenseActionFeedback(null);

        try {
            const result = await LicenseManager.purchasePro();
            if (result.status === 'success') {
                setLicenseActionFeedback({
                    kind: 'success',
                    message: t('paywall.purchaseSuccess')
                });
                return;
            }

            setLicenseActionFeedback({
                kind: 'error',
                message: getLicenseActionMessage(result, 'purchase')
            });
        } catch (error) {
            console.error('Settings purchase failed:', error);
            setLicenseActionFeedback({
                kind: 'error',
                message: t('paywall.purchaseFailed')
            });
        } finally {
            setLicenseActionBusy('idle');
        }
    };

    const handleLicenseRestore = async () => {
        setLicenseActionBusy('restore');
        setLicenseActionFeedback(null);

        try {
            const result = await LicenseManager.restorePurchases();
            if (result.status === 'success') {
                setLicenseActionFeedback({
                    kind: 'success',
                    message: t('paywall.restoreSuccess')
                });
                return;
            }

            setLicenseActionFeedback({
                kind: 'error',
                message: getLicenseActionMessage(result, 'restore')
            });
        } catch (error) {
            console.error('Settings restore failed:', error);
            setLicenseActionFeedback({
                kind: 'error',
                message: t('paywall.restoreFailed')
            });
        } finally {
            setLicenseActionBusy('idle');
        }
    };

    // Theme mode options
    const THEME_OPTIONS = [
        { id: 'dark', icon: Moon, label: t('settings.appearance.dark') },
        { id: 'light', icon: Sun, label: t('settings.appearance.light') },
        { id: 'sepia', icon: Coffee, label: t('settings.appearance.sepia') },
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>

                {/* Sidebar */}
                <div className="settings-sidebar">
                    <div className="sidebar-title">
                        <Settings className="w-5 h-5" style={{ color: 'var(--settings-accent)' }} />
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
                                            <div className="mode-card-title">{t('settings.modes.poster_title')}</div>
                                            <div className="mode-card-subtitle">{t('settings.modes.poster_subtitle')}</div>
                                        </div>
                                    </div>
                                    <div className="mode-card-body">
                                        <p className="mode-card-desc">
                                            {t('settings.modes.poster_desc')}
                                        </p>
                                        <ul className="mode-features">
                                            <li>{t('settings.modes.poster_feature1')}</li>
                                            <li>{t('settings.modes.poster_feature2')}</li>
                                            <li>{t('settings.modes.poster_feature3')}</li>
                                        </ul>
                                    </div>
                                    <div className="mode-card-footer">
                                        <span className="mode-cta">{t('settings.modes.poster_cta')}</span>
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
                                            <div className="mode-card-title">{t('settings.modes.icon_title')}</div>
                                            <div className="mode-card-subtitle">{t('settings.modes.icon_subtitle')}</div>
                                        </div>
                                    </div>
                                    <div className="mode-card-body">
                                        <p className="mode-card-desc">
                                            {t('settings.modes.icon_desc')}
                                        </p>
                                        <ul className="mode-features">
                                            <li>{t('settings.modes.icon_feature1')}</li>
                                            <li>{t('settings.modes.icon_feature2')}</li>
                                            <li>{t('settings.modes.icon_feature3')}</li>
                                        </ul>
                                    </div>
                                    <div className="mode-card-footer">
                                        <span className="mode-cta">{t('settings.modes.icon_cta')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-intro-section">
                                <h3>{t('settings.intro.title')}</h3>
                                <p>
                                    {t('settings.intro.desc1')}
                                </p>
                                <p>
                                    {t('settings.intro.desc2')}
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
                                    value={globalSettings.uiLanguage || 'auto'}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                >
                                    <option value="auto">
                                        {t('settings.general.language_auto')}
                                    </option>
                                    {SUPPORTED_UI_LANGUAGES.map(lang => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.flag} {lang.nativeName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Theme Mode */}
                            <div className="form-group">
                                <label className="form-label">{t('settings.appearance.theme_title')}</label>
                                <div className="theme-options">
                                    {THEME_OPTIONS.map(option => (
                                        <button
                                            key={option.id}
                                            className={`theme-option ${theme === option.id ? 'active' : ''}`}
                                            onClick={() => setTheme(option.id)}
                                        >
                                            <option.icon size={18} />
                                            <span>{option.label}</span>
                                        </button>
                                    ))}
                                </div>
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
                                    <img
                                        src={appLogo}
                                        alt="GlotShot"
                                        className="w-full h-full object-cover rounded-[22%]"
                                        style={{}}
                                    />
                                </div>
                                <div className="about-app-name">GlotShot</div>
                                <div className="about-app-desc">{t('settings.about.description')}</div>
                            </div>

                            <div className="about-scroll-container" style={{ marginTop: '20px' }}>
                                <div className="about-block mb-4">
                                    <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--settings-accent)' }}>{t('settings.about.features_title')}</h4>
                                    <ul className="text-sm opacity-80 space-y-1 list-disc pl-4">
                                        <li>{t('settings.about.feature_poster')}</li>
                                        <li>{t('settings.about.feature_icon')}</li>
                                        <li>{t('settings.about.feature_license')}</li>
                                    </ul>
                                </div>

                                <div className="about-meta py-4 border-t border-white/5">
                                    <div className="meta-row">
                                        <span className="meta-label">{t('settings.about.version')}</span>
                                        <span className="meta-value">v{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'}</span>
                                    </div>
                                    <div className="meta-row">
                                        <span className="meta-label">{t('settings.about.developer')}</span>
                                        <span className="meta-value">hooosberg</span>
                                    </div>
                                    <div className="meta-row">
                                        <span className="meta-label">{t('settings.about.email')}</span>
                                        <span className="meta-value">zikedece@proton.me</span>
                                    </div>
                                    <div className="meta-row">
                                        <span className="meta-label">{t('settings.about.github')}</span>
                                        <span className="meta-value">
                                            <a href="#" onClick={(e) => { e.preventDefault(); window.open('https://github.com/hooosberg/GlotShot', '_blank'); }}>
                                                github.com/hooosberg/GlotShot
                                            </a>
                                        </span>
                                    </div>
                                    <div className="meta-row">
                                        <span className="meta-label">{t('settings.about.website')}</span>
                                        <span className="meta-value">
                                            <a href="#" onClick={(e) => { e.preventDefault(); window.open('https://hooosberg.github.io/GlotShot/', '_blank'); }}>
                                                hooosberg.github.io/GlotShot
                                            </a>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="star-cta flex items-center justify-center gap-4" onClick={() => window.open('https://github.com/hooosberg/GlotShot', '_blank')}>
                                <Github size={32} />
                                <div className="flex flex-col items-start">
                                    <div className="font-bold text-lg leading-tight flex items-center gap-2">
                                        {t('settings.about.star_title')}
                                    </div>
                                    <div className="text-xs opacity-90 flex items-center gap-1 mt-1">
                                        <Star size={12} className="fill-current text-white/80" />
                                        {t('settings.about.cta_desc')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'license' && (
                        <div className="content-section wide-section">
                            <div className="license-section-header">
                                <h2 className="section-title">{t('paywall.licenseStatusTitle')}</h2>
                                <p className="license-section-hint">{t('settings.licenseTabHint')}</p>
                            </div>

                            <div className="license-overview-grid">
                                <div className="license-status-card">
                                    <div className="license-card-heading">
                                        <div className="license-card-icon">
                                            <Monitor size={22} />
                                        </div>
                                        <div>
                                            <div className="license-card-label">{t('paywall.currentPlan')}</div>
                                            <div className={`license-plan-pill ${licenseState.isPro ? 'is-pro' : 'is-free'}`}>
                                                {licenseState.isPro ? t('paywall.planPro') : t('paywall.planFree')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="license-card-description">
                                        {licenseState.isPro ? t('paywall.planProDesc') : t('paywall.planFreeDesc')}
                                    </div>
                                </div>

                                <div className="license-upgrade-card">
                                    <div className="license-card-heading">
                                        <div className="license-card-icon license-card-icon-gold">
                                            <Crown size={22} />
                                        </div>
                                        <div>
                                            <div className="license-card-label">{t('paywall.recommendedUpgradeTitle')}</div>
                                            <div className="license-card-price">
                                                {t('paywall.lifetimeBadge')} · {t('paywall.priceValue')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="license-card-description">
                                        {t('paywall.recommendedUpgradeDesc')}
                                    </div>
                                    <div className="license-action-row">
                                        {!licenseState.isPro && (
                                            <button
                                                type="button"
                                                className="license-primary-btn"
                                                onClick={() => void handleLicensePurchase()}
                                                disabled={licenseActionBusy !== 'idle'}
                                            >
                                                {licenseActionBusy === 'purchase'
                                                    ? t('paywall.purchasing')
                                                    : t('paywall.unlockNow')}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="license-secondary-btn"
                                            onClick={() => void handleLicenseRestore()}
                                            disabled={licenseActionBusy !== 'idle'}
                                        >
                                            {licenseActionBusy === 'restore'
                                                ? t('paywall.restoring')
                                                : t('paywall.restorePurchase')}
                                        </button>
                                    </div>
                                    {licenseActionFeedback && (
                                        <div className={`license-feedback ${licenseActionFeedback.kind}`}>
                                            {licenseActionFeedback.message}
                                        </div>
                                    )}
                                    <div className="license-cta-note">{t('paywall.ctaNote')}</div>
                                </div>
                            </div>

                            <div className="license-benefits-section">
                                <h3 className="license-benefits-title">{t('paywall.upgradeBenefitsTitle')}</h3>
                                <div className="license-benefits-grid">
                                    {LICENSE_BENEFIT_ITEMS.map((item) => (
                                        <div className="license-benefit-card" key={item.titleKey}>
                                            <div className="license-benefit-icon">
                                                <Check size={14} />
                                            </div>
                                            <div>
                                                <div className="license-benefit-name">{t(item.titleKey)}</div>
                                                <div className="license-benefit-desc">{t(item.descKey)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
