import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon, Type, FolderInput, Plus, Trash2, Globe, Settings, Copy, RefreshCw, Cpu, Monitor, RotateCcw, Save, Archive, ChevronDown, ChevronRight, ChevronUp, AlignLeft, AlignCenter, AlignRight, Palette } from 'lucide-react';
import './App.css';
import useClickOutside from './hooks/useClickOutside';
import IconFabric from './components/IconFabric/IconFabric';
import SettingsModal from './components/SettingsModal';
import DesignTips from './components/DesignTips';
import { useTranslation, I18nProvider, detectSystemLanguage } from './locales/i18n';
import ConfirmDialog from './components/ConfirmDialog';
import { translations } from './locales/translations';

// Default constants
const DEFAULT_WIDTH = 2880;
const DEFAULT_HEIGHT = 1800;

// Built-in backgrounds - 渐变配色
const PRESETS = [
  { id: 'bg1', name: '深海蓝调', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
  { id: 'bg2', name: '极光紫', value: 'linear-gradient(135deg, #2e1065 0%, #7c3aed 100%)' },
  { id: 'bg3', name: '日落橙', value: 'linear-gradient(135deg, #c2410c 0%, #fb923c 100%)' },
  { id: 'bg4', name: '清新绿', value: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)' },
  { id: 'bg5', name: '高级灰', value: 'linear-gradient(135deg, #374151 0%, #111827 100%)' },
  { id: 'bg6', name: '梅子黄', value: 'linear-gradient(135deg, #92400e 0%, #fbbf24 100%)' },
  { id: 'bg7', name: '樱花粉', value: 'linear-gradient(135deg, #be185d 0%, #f472b6 100%)' },
  { id: 'bg8', name: '海洋青', value: 'linear-gradient(135deg, #155e75 0%, #22d3ee 100%)' },
  { id: 'bg9', name: '薯莉紫', value: 'linear-gradient(135deg, #4c1d95 0%, #c4b5fd 100%)' },
  { id: 'bg10', name: '薄荷凉', value: 'linear-gradient(135deg, #065f46 0%, #6ee7b7 100%)' },
  { id: 'bg11', name: '灰蓝调', value: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)' },
  { id: 'bg12', name: '暮光金', value: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)' },
];

// 内置背景图片 (public/背景/)
const BUILTIN_BACKGROUNDS = [
  { id: 'builtin1', name: '金色', src: './背景/金色.png' },
  { id: 'builtin2', name: '壁纸', src: './背景/wallpaper003.png' },
  { id: 'builtin3', name: '渐变', src: './背景/ChatGPT Image 2025年6月2日 12_55_05.png' },
];

// Platform presets for promotional images (官方规格)
const PLATFORM_PRESETS = [
  // Apple - iPhone
  {
    id: 'iphone-6.9',
    name: 'iPhone 6.9" (Pro Max)',
    width: 1320, height: 2868,
    category: 'Apple',
    mode: 'poster',
    designTips: [
      '必须展示真实应用界面（in-app screenshots）',
      '文字叠加层建议不超过图片的 20%',
      '可添加背景、设备边框等设计元素',
      '此处仅设计一张主图，App Store Connect 会自动缩放'
    ]
  },
  {
    id: 'iphone-6.7',
    name: 'iPhone 6.7"',
    width: 1290, height: 2796,
    category: 'Apple',
    mode: 'poster',
    designTips: [
      '必须展示真实应用界面',
      '文字叠加层建议不超过 20%',
      '可添加背景设计元素'
    ]
  },
  {
    id: 'iphone-6.5',
    name: 'iPhone 6.5"',
    width: 1242, height: 2688,
    category: 'Apple',
    mode: 'poster',
    designTips: ['兼容旧机型，规格同上']
  },
  {
    id: 'iphone-5.5',
    name: 'iPhone 5.5"',
    width: 1242, height: 2208,
    category: 'Apple',
    mode: 'poster',
    designTips: ['兼容旧机型，规格同上']
  },
  // Apple - iPad
  {
    id: 'ipad-13',
    name: 'iPad 13" (M4)',
    width: 2064, height: 2752,
    category: 'Apple',
    mode: 'poster',
    designTips: [
      'iPad Pro 13" 最新尺寸',
      '规格同 iPhone 截图要求'
    ]
  },
  {
    id: 'ipad-12.9',
    name: 'iPad 12.9"',
    width: 2048, height: 2732,
    category: 'Apple',
    mode: 'poster',
    designTips: ['iPad Pro 12.9"，规格同上']
  },
  {
    id: 'ipad-11',
    name: 'iPad 11"',
    width: 1668, height: 2388,
    category: 'Apple',
    mode: 'poster',
    designTips: ['iPad Pro 11"，规格同上']
  },
  // Apple - Mac
  {
    id: 'mac',
    name: 'Mac App Store',
    width: 2880, height: 1800,
    category: 'Apple',
    mode: 'poster',
    designTips: [
      'macOS 应用截图',
      '最小尺寸 1280×800',
      '支持横屏展示'
    ]
  },
  // Google Play
  {
    id: 'android-phone',
    name: '手机截图',
    width: 1080, height: 1920,
    category: 'Google Play',
    mode: 'poster',
    designTips: [
      '必须展示真实应用界面',
      '文字说明不超过图片的 20%',
      '需提供至少 4 张截图',
      '可使用跨截图的连续设计'
    ]
  },
  {
    id: 'android-tablet',
    name: '平板截图',
    width: 1920, height: 1200,
    category: 'Google Play',
    mode: 'poster',
    designTips: [
      '16:10 横屏比例',
      '规格同手机截图'
    ]
  },
  {
    id: 'android-feature',
    name: 'Feature Graphic',
    width: 1024, height: 500,
    category: 'Google Play',
    mode: 'poster',
    designTips: [
      '应用页顶部横幅，纯设计图',
      '避免在边缘放置重要元素',
      '不要包含价格、排名等促销信息',
      '不需要放置应用截图'
    ]
  },
  // Windows Store
  {
    id: 'windows-hd',
    name: '桌面 1920×1080',
    width: 1920, height: 1080,
    category: 'Windows',
    mode: 'poster',
    designTips: [
      '推荐尺寸',
      '保持关键内容在上 2/3 区域',
      '支持最多 10 张截图'
    ]
  },
  {
    id: 'windows-min',
    name: '桌面 1366×768',
    width: 1366, height: 768,
    category: 'Windows',
    mode: 'poster',
    designTips: ['最小要求尺寸']
  },
  {
    id: 'windows-4k',
    name: '桌面 4K',
    width: 3840, height: 2160,
    category: 'Windows',
    mode: 'poster',
    designTips: ['高清 4K 支持']
  },
  // Steam
  {
    id: 'steam',
    name: 'Steam 截图',
    width: 1920, height: 1080,
    category: 'Steam',
    mode: 'poster',
    designTips: [
      '游戏内实际截图',
      '16:9 横屏比例',
      '展示核心玩法'
    ]
  },
  {
    id: 'steam-capsule',
    name: 'Steam 主胶囊',
    width: 1232, height: 706,
    category: 'Steam',
    mode: 'poster',
    designTips: [
      '商店页面主横幅',
      '纯设计图，展示游戏品牌',
      '避免小字体'
    ]
  },
];

// Font presets - 衍线字体 + 无衍线字体
const FONTS_CN = [
  { id: 'system', name: '系统默认', value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', type: 'sans' },
  { id: 'source-han-sans', name: '思源黑体', value: '"Source Han Sans SC", sans-serif', type: 'sans' },
  { id: 'pingfang', name: '苹方', value: '"PingFang SC", sans-serif', type: 'sans' },
  { id: 'source-han-serif', name: '思源宋体', value: '"Source Han Serif SC", "Noto Serif SC", serif', type: 'serif' },
  { id: 'kaiti', name: '华文楷体', value: '"STKaiti", "KaiTi", serif', type: 'serif' },
];

const FONTS_EN = [
  { id: 'system', name: 'System Default', value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', type: 'sans' },
  { id: 'inter', name: 'Inter', value: '"Inter", sans-serif', type: 'sans' },
  { id: 'sf-pro', name: 'SF Pro', value: '"SF Pro Display", sans-serif', type: 'sans' },
  { id: 'playfair', name: 'Playfair Display', value: '"Playfair Display", Georgia, serif', type: 'serif' },
  { id: 'georgia', name: 'Georgia', value: '"Georgia", "Times New Roman", serif', type: 'serif' },
];

// Text color presets - 海报设计常用配色
const TEXT_COLORS = [
  { id: 'white', name: '经典白', value: '#FFFFFF' },
  { id: 'neon-pink', name: '霓虹粉', value: '#FF6B9D' },
  { id: 'apple-blue', name: '苹果蓝', value: '#007AFF' },
  { id: 'mint-green', name: '薄荷绿', value: '#00D4AA' },
  { id: 'rose-gold', name: '玖瑰金', value: '#E8B4B8' },
  { id: 'sunset-orange', name: '日落橙', value: '#FF6B35' },
  { id: 'gradient-blue', name: '渐变蓝', value: '#60A5FA', gradient: ['#60A5FA', '#3B82F6'] },
  { id: 'gradient-purple', name: '渐变紫', value: '#A78BFA', gradient: ['#A78BFA', '#8B5CF6'] },
  { id: 'gradient-gold', name: '渐变金', value: '#FCD34D', gradient: ['#FCD34D', '#F59E0B'] },
];

// 描边颜色预设
const STROKE_COLORS = [
  { id: 'black', name: '黑色', value: 'rgba(0, 0, 0, 0.8)' },
  { id: 'dark-gray', name: '深灰', value: 'rgba(30, 30, 30, 0.8)' },
  { id: 'white', name: '白色', value: 'rgba(255, 255, 255, 0.8)' },
  { id: 'blue', name: '蓝色', value: 'rgba(59, 130, 246, 0.8)' },
  { id: 'purple', name: '紫色', value: 'rgba(139, 92, 246, 0.8)' },
];

// 全球语言列表
const LANGUAGES = [
  { code: 'zh-CN', name: '简体中文', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文', flag: '🇹🇼' },
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
  { code: 'hi', name: 'हिन्दी', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'ไทย', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Bahasa Indonesia', nativeName: 'Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', nativeName: 'Melayu', flag: '🇲🇾' },
  { code: 'nl', name: 'Nederlands', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Türkçe', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'uk', name: 'Українська', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'cs', name: 'Čeština', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'sv', name: 'Svenska', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Dansk', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Suomi', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'no', name: 'Norsk', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'el', name: 'Ελληνικά', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'he', name: 'עברית', nativeName: 'עברית', flag: '🇮🇱' },
  { code: 'ro', name: 'Română', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'hu', name: 'Magyar', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'none', name: '不使用翻译', nativeName: '—', flag: '🚫' },
];


const DEFAULT_SCENE_SETTINGS = {
  screenshotScale: 0.8,
  screenshotY: 400,
  screenshotX: 0,
  screenshotShadow: true, // 截图阴影开关
  // 中文文字设置
  textYCN: 150,
  textSizeCN: 120,
  // 英文文字设置
  textYEN: 150,
  textSizeEN: 100,
};

const App = () => {
  const { t, language, changeLanguage } = useTranslation();

  // Update Electron menu language
  useEffect(() => {
    if (window.electron && translations[language] && translations[language].menu) {
      window.electron.updateMenuLanguage(translations[language].menu);
    }
  }, [language]);

  // Translation mapping for preset names
  const PRESET_NAME_MAP = {
    'android-phone': 'presets.phoneScreenshot',
    'android-tablet': 'presets.tabletScreenshot',
    'windows-hd': 'presets.desktop',
    'windows-min': 'presets.desktop',
    'windows-4k': 'presets.desktop',
    'steam': 'presets.steamScreenshot',
    'steam-capsule': 'presets.steamCapsule',
  };

  // Translation mapping for font names
  const FONT_NAME_MAP = {
    'system': 'fonts.systemDefault',
    'source-han-sans': 'fonts.sourceHanSans',
    'pingfang': 'fonts.pingfang',
    'source-han-serif': 'fonts.sourceHanSerif',
    'kaiti': 'fonts.stkaiti',
  };

  // Get translated preset name
  const getPresetName = (presetId, originalName) => {
    const translationKey = PRESET_NAME_MAP[presetId];
    if (translationKey) {
      return t(translationKey);
    }
    return originalName; // iPad, iPhone, Mac App Store etc. keep original names
  };

  // Get translated font name
  const getFontName = (fontId, originalName) => {
    const translationKey = FONT_NAME_MAP[fontId];
    if (translationKey) {
      return t(translationKey);
    }
    return originalName;
  };

  // Design tips translation mapping
  const DESIGN_TIP_MAP = {
    // Mac
    'macOS 应用截图': 'designTipsContent.macScreenshot',
    '最小尺寸 1280×800': 'designTipsContent.minSize',
    '支持横屏展示': 'designTipsContent.supportsLandscape',
    // iPhone
    '必须展示真实应用界面（in-app screenshots）': 'designTipsContent.mustShowRealUIInApp',
    '必须展示真实应用界面': 'designTipsContent.mustShowRealUI',
    '文字叠加层建议不超过图片的 20%': 'designTipsContent.textOverlayNotExceed20',
    '文字叠加层建议不超过 20%': 'designTipsContent.textOverlayNotExceed20Short',
    '可添加背景、设备边框等设计元素': 'designTipsContent.canAddBackgroundElements',
    '可添加背景设计元素': 'designTipsContent.canAddBackgroundShort',
    '此处仅设计一张主图，App Store Connect 会自动缩放': 'designTipsContent.designOneMainImage',
    '兼容旧机型，规格同上': 'designTipsContent.compatibleOldModels',
    // iPad
    'iPad Pro 13\" 最新尺寸': 'designTipsContent.ipadPro13Latest',
    '规格同 iPhone 截图要求': 'designTipsContent.sameAsIPhoneSpecs',
    'iPad Pro 12.9\"，规格同上': 'designTipsContent.ipadPro129SameSpecs',
    'iPad Pro 11\"，规格同上': 'designTipsContent.ipadPro11SameSpecs',
    // Google Play
    '文字说明不超过图片的 20%': 'designTipsContent.textNotExceed20',
    '需提供至少 4 张截图': 'designTipsContent.atLeast4Screenshots',
    '可使用跨截图的连续设计': 'designTipsContent.continuousDesign',
    '16:10 横屏比例': 'designTipsContent.landscapeRatio',
    '规格同手机截图': 'designTipsContent.sameAsPhone',
    '应用页顶部横幅，纯设计图': 'designTipsContent.topBanner',
    '避免在边缘放置重要元素': 'designTipsContent.avoidEdges',
    '不要包含价格、排名等促销信息': 'designTipsContent.noPromoInfo',
    '不需要放置应用截图': 'designTipsContent.noScreenshots',
    // Windows
    '推荐尺寸': 'designTipsContent.recommended',
    '保持关键内容在上 2/3 区域': 'designTipsContent.keepContentTop',
    '支持最多 10 张截图': 'designTipsContent.max10Screenshots',
    '最小要求尺寸': 'designTipsContent.minRequired',
    '高清 4K 支持': 'designTipsContent.hd4k',
    // Steam
    '游戏内实际截图': 'designTipsContent.actualGameplay',
    '16:9 横屏比例': 'designTipsContent.ratio16by9',
    '展示核心玩法': 'designTipsContent.showCoreGameplay',
    '商店页面主横幅': 'designTipsContent.mainBanner',
    '纯设计图，展示游戏品牌': 'designTipsContent.showBrand',
    '避免小字体': 'designTipsContent.avoidSmallFont',
  };

  // Get translated design tip
  const getDesignTip = (tip) => {
    const translationKey = DESIGN_TIP_MAP[tip];
    if (translationKey) {
      // Handle special cases with dynamic content
      if (tip === '最小尺寸 1280×800') {
        return `${t('designTipsContent.minSize')} 1280×800`;
      }
      return t(translationKey);
    }
    return tip;
  };

  // Translate design tips array
  const translateDesignTips = (tips) => {
    if (!tips) return [];
    return tips.map(tip => getDesignTip(tip));
  };

  // Global Settings with localStorage persistence
  const [globalSettings, setGlobalSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('appstore_builder_global');
      if (saved) {
        return {
          ...{
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            backgroundType: 'preset',
            backgroundValue: PRESETS[0].value,
            backgroundUpload: null,
            // Text styling
            textAlign: 'center',
            fontCN: FONTS_CN[0].value,
            fontEN: FONTS_EN[0].value,
            textColorCN: TEXT_COLORS[0].id,
            textColorEN: TEXT_COLORS[0].id,
            // Text effects
            textShadow: true,
            textStroke: false,
            strokeColor: STROKE_COLORS[0].id,
            fadeStart: 0.7,
            fadeOpacity: 0.25,
            textUppercase: false,
            primaryLang: (() => {
              try {
                const sys = navigator.language;
                const match = LANGUAGES.find(l => l.code === sys || (sys.startsWith(l.code) && l.code !== 'none'));
                return match ? match.code : 'zh-CN';
              } catch { return 'zh-CN'; }
            })(),
            secondaryLang: 'en',
            uiLanguage: (() => {
              try {
                const sys = navigator.language;
                return sys.startsWith('zh') ? 'zh-CN' : 'en';
              } catch { return 'zh-CN'; }
            })(),
          }, ...JSON.parse(saved)
        };
      }
    } catch { }
    return {
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      backgroundType: 'preset',
      backgroundValue: PRESETS[0].value,
      backgroundUpload: null,
      // Text styling
      textAlign: 'center',
      fontCN: FONTS_CN[0].value,
      fontEN: FONTS_EN[0].value,
      textColorCN: TEXT_COLORS[0].id,
      textColorEN: TEXT_COLORS[0].id,
      // Text effects
      textShadow: true,
      textStroke: false,
      strokeColor: STROKE_COLORS[0].id,
      // Text fade control (bottom gradient)
      fadeStart: 0.7,
      fadeOpacity: 0.25,
      // Text transform
      textUppercase: false,
      // Multi-language settings
      primaryLang: 'zh-CN',
      secondaryLang: 'en',
      uiLanguage: 'zh-CN',
    };
  });

  // Uploaded backgrounds - stored in localStorage as base64
  const [uploadedBackgrounds, setUploadedBackgrounds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('appstore_builder_backgrounds')) || [];
    } catch { return []; }
  });

  // Theme Settings - Forced Dark Mode
  const [theme] = useState('dark');
  const setTheme = () => { }; // No-op since theme is locked

  // Glass Effect Settings
  const [glassEffect, setGlassEffect] = useState(() => {
    return localStorage.getItem('app_glass_effect') !== 'false';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.removeItem('app_theme'); // Clean up legacy storage
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-glass', glassEffect);
    localStorage.setItem('app_glass_effect', glassEffect);
  }, [glassEffect]);

  const [backgroundFolderPath, setBackgroundFolderPath] = useState('');

  // UI state for collapsible sections
  const [bgExpanded, setBgExpanded] = useState(true);
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
  const [langSettingsOpen, setLangSettingsOpen] = useState(false);

  // App mode: 'screenshot' for screenshot builder, 'icon' for icon factory
  const [appMode, setAppMode] = useState('screenshot');
  const [selectedPlatform, setSelectedPlatform] = useState('mac');

  // Modals
  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('start');

  // Custom Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    onConfirm: () => { },
    type: 'danger'
  });

  // Refs for click outside
  const platformDropdownRef = useRef(null);
  const langSettingsRef = useRef(null);
  const savePresetModalRef = useRef(null);

  useClickOutside(platformDropdownRef, () => setPlatformDropdownOpen(false));
  useClickOutside(langSettingsRef, () => setLangSettingsOpen(false));
  useClickOutside(savePresetModalRef, () => setShowSavePresetModal(false));

  // Listen for IPC events from Main Process
  useEffect(() => {
    if (window.electron) {
      window.electron.on('show-settings', () => {
        setSettingsInitialTab('start');
        setShowSettingsModal(true);
      });
      window.electron.on('show-about', () => {
        setSettingsInitialTab('about');
        setShowSettingsModal(true);
      });
      window.electron.on('menu-mode-screenshot', () => setAppMode('screenshot'));
      window.electron.on('menu-mode-icon', () => setAppMode('icon'));
      window.electron.on('menu-import', () => handleElectronBatchUpload());
      window.electron.on('menu-export', () => handleExportAll());
    }
  }, []); // eslint-disable-line

  // Persist globalSettings to localStorage
  useEffect(() => {
    const { backgroundUpload, ...settingsToSave } = globalSettings;
    localStorage.setItem('appstore_builder_global', JSON.stringify(settingsToSave));
  }, [globalSettings]);

  // Persist uploaded backgrounds to localStorage
  useEffect(() => {
    // Limit to last 20 backgrounds to avoid localStorage size issues
    const toSave = uploadedBackgrounds.slice(-20);
    try {
      localStorage.setItem('appstore_builder_backgrounds', JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save backgrounds to localStorage', e);
    }
  }, [uploadedBackgrounds]);

  // Config Management
  const [savedConfigs, setSavedConfigs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('appstore_builder_configs')) || [];
    } catch { return []; }
  });
  const [configName, setConfigName] = useState('');

  // Custom Size Presets (user-defined)
  const [customSizePresets, setCustomSizePresets] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('appstore_builder_custom_sizes')) || [];
    } catch { return []; }
  });
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  // Save custom size preset
  const saveCustomSizePreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      width: globalSettings.width,
      height: globalSettings.height,
      category: '自定义'
    };
    const updated = [...customSizePresets, newPreset];
    setCustomSizePresets(updated);
    localStorage.setItem('appstore_builder_custom_sizes', JSON.stringify(updated));
    setNewPresetName('');
    setShowSavePresetModal(false);
    setSelectedPlatform(newPreset.id);
  };

  const deleteCustomSizePreset = (id) => {
    const updated = customSizePresets.filter(p => p.id !== id);
    setCustomSizePresets(updated);
    localStorage.setItem('appstore_builder_custom_sizes', JSON.stringify(updated));
  };


  // Ollama Settings
  const [ollamaConfig, setOllamaConfig] = useState({
    host: 'http://localhost:11434',
    model: '',
    availableModels: [],
    isConnected: false,
    autoTranslate: true
  });
  const [showOllamaGuide, setShowOllamaGuide] = useState(false);

  // Scenes Management - stored in localStorage with base64 screenshots
  const [scenes, setScenes] = useState(() => {
    try {
      const saved = localStorage.getItem('appstore_builder_scenes');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch { }
    return [{
      id: 1,
      name: '首页展示',
      screenshot: null,
      titleCN: '智能续写，激发无限灵感',
      titleEN: 'Smart Continue, Infinite Inspiration',
      settings: { ...DEFAULT_SCENE_SETTINGS }
    }];
  });

  const [activeSceneId, setActiveSceneId] = useState(1);
  const [previewLanguage, setPreviewLanguage] = useState('primary'); // 'primary' or 'secondary'
  const [selectedSceneIds, setSelectedSceneIds] = useState(new Set()); // 多选状态
  const [importProgress, setImportProgress] = useState({ active: false, current: 0, total: 0, message: '' }); // 导入进度
  const canvasRef = useRef(null);
  // 确保 activeScene 始终有效，并有默认 settings
  const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0] || {
    id: 1,
    name: '场景 1',
    screenshot: null,
    titleCN: '',
    titleEN: '',
    settings: { ...DEFAULT_SCENE_SETTINGS }
  };

  // Persist scenes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('appstore_builder_scenes', JSON.stringify(scenes));
    } catch (e) {
      console.warn('Failed to save scenes to localStorage', e);
    }
  }, [scenes]);

  // --- OLLAMA INTEGRATION ---

  const checkOllamaConnection = async () => {
    try {
      const response = await fetch(`${ollamaConfig.host}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        const models = data.models.map(m => m.name);
        setOllamaConfig(prev => ({
          ...prev,
          isConnected: true,
          availableModels: models,
          model: prev.model || models[0] || ''
        }));
      } else {
        throw new Error('Failed to connect');
      }
    } catch (error) {
      console.error("Ollama connection failed:", error);
      setOllamaConfig(prev => ({ ...prev, isConnected: false }));
    }
  };

  useEffect(() => {
    checkOllamaConnection();
  }, []);

  const translateText = async (text, targetLangCode = 'en') => {
    if (!ollamaConfig.isConnected || !ollamaConfig.model) return text;

    try {
      // Find language name
      const targetLang = LANGUAGES.find(l => l.code === targetLangCode);
      const targetLangName = targetLang ? targetLang.name : 'English';

      const prompt = `Translate the following mobile app feature title into ${targetLangName}. Keep it concise, marketing style. Only output the ${targetLangName} text, no explanations. Text: "${text}"`;

      const response = await fetch(`${ollamaConfig.host}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaConfig.model,
          prompt: prompt,
          stream: false
        })
      });

      const data = await response.json();
      return data.response.trim().replace(/^"|"$/g, '');
    } catch (e) {
      console.error("Translation error:", e);
      return "";
    }
  };

  // --- CANVAS LOGIC ---

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const drawCanvas = useCallback(async (canvas, scene, language, isExport = false) => {
    if (!canvas || !scene) return;
    const ctx = canvas.getContext('2d');
    const { width, height, backgroundType, backgroundValue, backgroundUpload } = globalSettings;

    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background
    if ((backgroundType === 'upload' || backgroundType === 'builtin') && backgroundUpload) {
      try {
        const bgImg = await loadImage(backgroundUpload);
        const ratio = Math.max(width / bgImg.width, height / bgImg.height);
        const centerShift_x = (width - bgImg.width * ratio) / 2;
        const centerShift_y = (height - bgImg.height * ratio) / 2;
        ctx.drawImage(bgImg, 0, 0, bgImg.width, bgImg.height, centerShift_x, centerShift_y, bgImg.width * ratio, bgImg.height * ratio);
      } catch (e) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      // Parse gradient from CSS linear-gradient string
      const g = ctx.createLinearGradient(0, 0, width, height);
      const gradientMatch = backgroundValue.match(/#[a-fA-F0-9]{6}/g);
      if (gradientMatch && gradientMatch.length >= 2) {
        g.addColorStop(0, gradientMatch[0]);
        g.addColorStop(1, gradientMatch[1]);
      } else {
        g.addColorStop(0, '#334155');
        g.addColorStop(1, '#475569');
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Draw Text (Middle Layer) - 支持多语言系统
    // 确定当前显示的语言类型 (primary 或 secondary)
    const isPrimaryLang = language === 'primary' || language === 'CN';
    let text = isPrimaryLang ? scene.titleCN : scene.titleEN;

    // 如果是翻译语言且开启大写，应用大写转换
    if (!isPrimaryLang && globalSettings.textUppercase && text) {
      text = text.toUpperCase();
    }

    if (text) {
      // 根据语言选择对应的字体设置
      const fontSize = isPrimaryLang
        ? (scene.settings.textSizeCN || 120)
        : (scene.settings.textSizeEN || 100);
      const textY = isPrimaryLang
        ? (scene.settings.textYCN || 150)
        : (scene.settings.textYEN || 150);

      // Get font from globalSettings
      const fontFamily = isPrimaryLang ? globalSettings.fontCN : globalSettings.fontEN;
      ctx.font = `bold ${fontSize}px ${fontFamily}`;

      // Get text alignment
      const textAlign = globalSettings.textAlign || 'center';
      ctx.textAlign = textAlign;
      ctx.textBaseline = 'top';

      // Calculate X position based on alignment
      let textX;
      if (textAlign === 'left') {
        textX = width * 0.1; // 10% padding from left
      } else if (textAlign === 'right') {
        textX = width * 0.9; // 10% padding from right
      } else {
        textX = width / 2;
      }

      // Get color settings
      const colorId = isPrimaryLang ? globalSettings.textColorCN : globalSettings.textColorEN;
      const colorPreset = TEXT_COLORS.find(c => c.id === colorId) || TEXT_COLORS[0];

      // Apply text shadow if enabled
      if (globalSettings.textShadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = fontSize * 0.15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = fontSize * 0.05;
      }

      // Apply color with bottom fade effect - use fadeStart and fadeOpacity
      const fadeStart = globalSettings.fadeStart || 0.7;
      const fadeOpacity = globalSettings.fadeOpacity || 0.25;
      const fadeHex = Math.round(fadeOpacity * 255).toString(16).padStart(2, '0');

      const gradient = ctx.createLinearGradient(0, textY, 0, textY + fontSize);
      if (colorPreset.gradient) {
        gradient.addColorStop(0, colorPreset.gradient[0]);
        gradient.addColorStop(fadeStart, colorPreset.gradient[1]);
        gradient.addColorStop(1, colorPreset.gradient[1] + fadeHex);
      } else {
        gradient.addColorStop(0, colorPreset.value);
        gradient.addColorStop(fadeStart, colorPreset.value);
        gradient.addColorStop(1, colorPreset.value + fadeHex);
      }
      ctx.fillStyle = gradient;

      // Draw stroke if enabled - use selected stroke color
      if (globalSettings.textStroke) {
        const strokeColorPreset = STROKE_COLORS.find(c => c.id === globalSettings.strokeColor) || STROKE_COLORS[0];
        ctx.strokeStyle = strokeColorPreset.value;
        ctx.lineWidth = fontSize * 0.03;
        ctx.lineJoin = 'round';
      }

      // Split text by newlines and draw each line
      const lines = text.split('\n');
      const lineHeight = fontSize * 1.2; // 120% line height

      lines.forEach((line, index) => {
        const lineY = textY + (index * lineHeight);

        // Update gradient for each line position
        const lineGradient = ctx.createLinearGradient(0, lineY, 0, lineY + fontSize);
        if (colorPreset.gradient) {
          lineGradient.addColorStop(0, colorPreset.gradient[0]);
          lineGradient.addColorStop(fadeStart, colorPreset.gradient[1]);
          lineGradient.addColorStop(1, colorPreset.gradient[1] + fadeHex);
        } else {
          lineGradient.addColorStop(0, colorPreset.value);
          lineGradient.addColorStop(fadeStart, colorPreset.value);
          lineGradient.addColorStop(1, colorPreset.value + fadeHex);
        }
        ctx.fillStyle = lineGradient;

        // Draw stroke first if enabled
        if (globalSettings.textStroke) {
          ctx.strokeText(line, textX, lineY);
        }

        // Draw fill
        ctx.fillText(line, textX, lineY);
      });

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }



    // 3. Draw Screenshot (Top Layer)
    if (scene.screenshot) {
      try {
        const ssImg = await loadImage(scene.screenshot);
        const baseScale = scene.settings.screenshotScale || 0.8;
        const targetWidth = width * 0.6 * baseScale;
        const ratio = targetWidth / ssImg.width;
        const targetHeight = ssImg.height * ratio;

        const x = (width - targetWidth) / 2 + (scene.settings.screenshotX || 0);
        const y = (scene.settings.screenshotY || 400);

        // Shadow - controlled by screenshotShadow setting
        if (scene.settings.screenshotShadow !== false) {
          ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
          ctx.shadowBlur = 50;
          ctx.shadowOffsetY = 30;
        }

        ctx.drawImage(ssImg, x, y, targetWidth, targetHeight);

        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
      } catch (e) {
        console.error("Error loading screenshot", e);
      }
    }

  }, [globalSettings]);

  useEffect(() => {
    if (activeScene && canvasRef.current) {
      drawCanvas(canvasRef.current, activeScene, previewLanguage);
    }
  }, [activeScene, globalSettings, previewLanguage, drawCanvas]);


  // --- HANDLERS ---

  // 处理截图导入 - 支持 Electron 两步选择或普通文件上传
  const handleBatchUpload = async (e) => {
    let imagesToImport = [];

    // 判断是来自 Electron 还是普通文件上传
    if (e && e.target && e.target.files) {
      // 普通文件上传模式
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      if (imageFiles.length === 0) return;

      for (const file of imageFiles) {
        const reader = new FileReader();
        const dataUrl = await new Promise(resolve => {
          reader.onload = (evt) => resolve(evt.target.result);
          reader.readAsDataURL(file);
        });
        imagesToImport.push({
          name: file.name.replace(/\.[^/.]+$/, ""),
          data: dataUrl
        });
      }
    } else {
      return;
    }

    await importScreenshots(imagesToImport);
  };

  // Electron 直接选择图片文件（支持多选）
  const handleElectronBatchUpload = async () => {
    if (!window.electron) {
      alert(t('alerts.electronOnly'));
      return;
    }

    // 直接弹出文件选择器，用户可以自由导航到任何文件夹并选择文件
    const filePaths = await window.electron.selectFiles({ multiSelections: true });
    if (!filePaths || filePaths.length === 0) return;

    // 读取选中的文件
    const result = await window.electron.readFiles(filePaths);
    if (!result.success || result.images.length === 0) {
      alert(t('alerts.readFilesError'));
      return;
    }

    const imagesToImport = result.images.map(img => ({
      name: img.name.replace(/\.[^/.]+$/, ""),
      data: img.data
    }));

    await importScreenshots(imagesToImport);
  };

  // 导入截图的核心逻辑 - 支持重名确认和进度显示
  const importScreenshots = async (imagesToImport) => {
    if (imagesToImport.length === 0) return;

    // 检查重名文件
    const existingNames = new Set(scenes.filter(s => s.screenshot).map(s => s.name));
    const duplicates = imagesToImport.filter(img => existingNames.has(img.name));

    let imagesToProcess = imagesToImport;

    // 如果有重名文件，询问用户
    if (duplicates.length > 0) {
      const duplicateNames = duplicates.map(d => d.name).slice(0, 5).join('\n• ');
      const moreCount = duplicates.length > 5 ? `\n... (+${duplicates.length - 5})` : '';
      const confirmMsg = t('alerts.duplicateScreenshots', { n: duplicates.length, names: duplicateNames, more: moreCount });

      if (!window.confirm(confirmMsg)) {
        // 用户选择跳过重复的
        imagesToProcess = imagesToImport.filter(img => !existingNames.has(img.name));
        if (imagesToProcess.length === 0) {
          alert(t('alerts.noNewScreenshots'));
          return;
        }
      }
    }

    // 开始导入，显示进度条
    setImportProgress({ active: true, current: 0, total: imagesToProcess.length, message: '准备导入...' });

    // 检查是否是默认空场景
    const isDefaultState = scenes.length === 1 && !scenes[0].screenshot;

    // 处理重名覆盖
    let updatedScenes = isDefaultState ? [] : [...scenes];
    let startId = isDefaultState ? 1 : (Math.max(...scenes.map(s => s.id), 0) + 1);

    for (let i = 0; i < imagesToProcess.length; i++) {
      const img = imagesToProcess[i];
      const nameWithoutExt = img.name;

      // 更新进度
      setImportProgress({
        active: true,
        current: i + 1,
        total: imagesToProcess.length,
        message: `正在导入: ${nameWithoutExt}`
      });

      // Auto translate if enabled
      let enTitle = "";
      if (ollamaConfig.isConnected && ollamaConfig.autoTranslate) {
        enTitle = await translateText(nameWithoutExt, globalSettings.secondaryLang);
      }

      // 检查是否存在同名场景
      const existingIndex = updatedScenes.findIndex(s => s.name === nameWithoutExt);

      const newScene = {
        id: existingIndex >= 0 ? updatedScenes[existingIndex].id : startId++,
        name: nameWithoutExt,
        screenshot: img.data,
        titleCN: nameWithoutExt,
        titleEN: enTitle || nameWithoutExt,
        settings: existingIndex >= 0 ? updatedScenes[existingIndex].settings : { ...scenes[0]?.settings || DEFAULT_SCENE_SETTINGS }
      };

      if (existingIndex >= 0) {
        // 覆盖已存在的场景
        updatedScenes[existingIndex] = newScene;
      } else {
        updatedScenes.push(newScene);
      }
    }

    setScenes(updatedScenes);

    // Switch to first new scene
    if (imagesToProcess.length > 0) {
      const firstImported = updatedScenes.find(s => s.name === imagesToProcess[0].name);
      if (firstImported) {
        setActiveSceneId(firstImported.id);
      }
    }

    // 隐藏进度条
    setTimeout(() => {
      setImportProgress({ active: false, current: 0, total: 0, message: '' });
    }, 500);
  };

  const handleBgUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setGlobalSettings(prev => ({ ...prev, backgroundType: 'upload', backgroundUpload: evt.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 背景图片导入 - 直接选择文件（支持多选），支持重名覆盖
  const handleDirectoryBgUpload = async () => {
    if (!window.electron) {
      alert(t('alerts.electronOnly'));
      return;
    }

    // 直接弹出文件选择器
    const filePaths = await window.electron.selectFiles({ multiSelections: true });
    if (!filePaths || filePaths.length === 0) return;

    // 读取选中的文件
    const result = await window.electron.readFiles(filePaths);
    if (!result.success || result.images.length === 0) {
      alert(t('alerts.readFilesError'));
      return;
    }

    // 导入并覆盖同名背景
    setUploadedBackgrounds(prev => {
      const existingNames = new Map(prev.map(bg => [bg.name, bg]));
      // 覆盖同名文件
      for (const img of result.images) {
        existingNames.set(img.name, img);
      }
      return Array.from(existingNames.values());
    });

    // Auto-select first image
    setGlobalSettings(prev => ({
      ...prev,
      backgroundType: 'upload',
      backgroundUpload: result.images[0].data
    }));
  };



  const deleteUploadedBackground = (index, e) => {
    e.stopPropagation();

    setConfirmDialog({
      isOpen: true,
      title: t('common.delete'),
      message: t('alerts.confirmDeleteBackground'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      type: 'danger',
      onConfirm: () => {
        const bgToDelete = uploadedBackgrounds[index];
        const updated = uploadedBackgrounds.filter((_, i) => i !== index);
        setUploadedBackgrounds(updated);

        // If the deleted background was currently selected, reset to default
        if (globalSettings.backgroundType === 'upload' && globalSettings.backgroundUpload === bgToDelete.data) {
          setGlobalSettings(prev => ({
            ...prev,
            backgroundType: 'preset',
            backgroundValue: PRESETS[0].value,
            backgroundUpload: null
          }));
        }
      }
    });
  };

  const updateScene = (id, updates) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const updateSceneSettings = (key, value) => {
    setScenes(prev => prev.map(s => s.id === activeSceneId ? {
      ...s,
      settings: { ...s.settings, [key]: value }
    } : s));
  };

  const resetSceneSetting = (key) => {
    updateSceneSettings(key, DEFAULT_SCENE_SETTINGS[key]);
  }

  // Apply current scene settings to ALL scenes
  const applySettingsToAll = () => {
    if (!window.confirm(t('alerts.confirmApplyAll'))) return;
    const currentSettings = activeScene.settings;
    setScenes(prev => prev.map(s => ({
      ...s,
      settings: { ...currentSettings }
    })));
  };

  const deleteScene = (id) => {
    if (scenes.length === 1) {
      // Don't delete last one, just clear it - 确保有完整的 settings
      setScenes([{
        id: scenes[0].id,
        screenshot: null,
        name: '场景 1',
        titleCN: '',
        titleEN: '',
        settings: { ...DEFAULT_SCENE_SETTINGS }
      }]);
      return;
    }
    setScenes(prev => prev.filter(s => s.id !== id));
    setSelectedSceneIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (activeSceneId === id) setActiveSceneId(scenes[0].id);
  };

  // 多选删除
  const deleteSelectedScenes = () => {
    if (selectedSceneIds.size === 0) return;
    if (!window.confirm(t('alerts.confirmDeleteSelected', { n: selectedSceneIds.size }))) return;

    // 如果全部选中，保留一个空场景 - 确保有完整的 settings
    if (selectedSceneIds.size >= scenes.filter(s => s.screenshot).length) {
      setScenes([{
        id: 1,
        screenshot: null,
        name: '场景 1',
        titleCN: '',
        titleEN: '',
        settings: { ...DEFAULT_SCENE_SETTINGS }
      }]);
      setActiveSceneId(1);
    } else {
      const remaining = scenes.filter(s => !selectedSceneIds.has(s.id));
      setScenes(remaining);
      if (selectedSceneIds.has(activeSceneId)) {
        setActiveSceneId(remaining[0]?.id || 1);
      }
    }
    setSelectedSceneIds(new Set());
  };

  // 切换选中状态
  const toggleSceneSelection = (id, e) => {
    e.stopPropagation();
    setSelectedSceneIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 全选/取消全选 - 只操作有截图的场景
  const toggleSelectAll = () => {
    const validScenes = scenes.filter(s => s.screenshot);
    if (selectedSceneIds.size === validScenes.length && validScenes.length > 0) {
      setSelectedSceneIds(new Set());
    } else {
      setSelectedSceneIds(new Set(validScenes.map(s => s.id)));
    }
  };

  const saveConfig = () => {
    if (!configName) return alert(t('alerts.enterConfigName'));
    const newConfig = { name: configName, settings: activeScene.settings };
    const updated = [...savedConfigs, newConfig];
    setSavedConfigs(updated);
    localStorage.setItem('appstore_builder_configs', JSON.stringify(updated));
    setConfigName('');
    alert(t('alerts.configSaved'));
  };

  const loadConfig = (config) => {
    if (window.confirm(t('alerts.loadConfigConfirm', { name: config.name }))) {
      setScenes(prev => prev.map(s => s.id === activeSceneId ? {
        ...s,
        settings: { ...config.settings }
      } : s));
    }
  };

  const deleteConfig = (index) => {
    const updated = savedConfigs.filter((_, i) => i !== index);
    setSavedConfigs(updated);
    localStorage.setItem('appstore_builder_configs', JSON.stringify(updated));
  }


  // --- EXPORT LOGIC ---
  const handleExportAll = async () => {
    // Check mode and dispatch event if in Icon mode
    if (appMode === 'icon') {
      window.dispatchEvent(new CustomEvent('trigger-icon-export'));
      return;
    }

    // 1. Select Directory via Electron
    if (!window.electron) return alert(t('alerts.outputDirElectronOnly'));

    const basePath = await window.electron.selectDirectory();
    if (!basePath) return; // User cancelled

    const tempCanvas = document.createElement('canvas');
    const exportFiles = [];

    // Helper to get Blob
    const getCanvasData = async (scene, lang) => {
      await drawCanvas(tempCanvas, scene, lang, true);
      return tempCanvas.toDataURL('image/jpeg', 0.9);
    };

    alert(t('alerts.exportStart', { path: basePath }));

    for (const scene of scenes) {
      if (!scene.screenshot) continue;

      const cnData = await getCanvasData(scene, 'CN');
      exportFiles.push({ path: `中文/${scene.name}.jpg`, data: cnData });

      const enData = await getCanvasData(scene, 'EN');
      exportFiles.push({ path: `English/${scene.name}.jpg`, data: enData });
    }

    // 2. Save via Electron
    const result = await window.electron.saveFiles({ basePath, files: exportFiles });

    if (result.success) {
      alert("导出成功！\nExport Completed Successfully!");
    } else {
      alert("导出失败: " + result.error);
    }
  };

  // Platform preset change handler
  const handlePlatformChange = (preset) => {
    setSelectedPlatform(preset.id);
    setGlobalSettings(prev => ({
      ...prev,
      width: preset.width,
      height: preset.height
    }));
    setPlatformDropdownOpen(false);
  };

  // Get current platform name
  const getCurrentPlatformName = () => {
    const preset = PLATFORM_PRESETS.find(p => p.id === selectedPlatform);
    return preset ? getPresetName(preset.id, preset.name) : t('categories.custom');
  };

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden no-scrollbar app-container">

      {/* GLOBAL TOP TITLE BAR */}
      <div className="global-titlebar h-12 flex items-center justify-between px-4 shrink-0 drag-region bg-[#1e1e24] border-b border-white/5">
        {/* Left section with mode switcher and platform dropdown */}
        <div className="flex items-center gap-3 no-drag" style={{ marginLeft: '70px' }}>

          {/* Platform Preset Dropdown - only show in screenshot mode */}
          {appMode === 'screenshot' && (
            <div className="relative" ref={platformDropdownRef}>
              <button
                onClick={() => setPlatformDropdownOpen(!platformDropdownOpen)}
                className="flex items-center gap-2 h-8 px-3 bg-white/5 hover:bg-white/10 rounded-md text-xs font-medium transition border border-white/10"
                title={t('rightPanel.sizePreset')}
              >
                <Monitor className="w-4 h-4 text-blue-400" />
                <span className="text-gray-200">{getCurrentPlatformName()}</span>
                {platformDropdownOpen ? <ChevronUp className="w-3 h-3 text-gray-500" /> : <ChevronDown className="w-3 h-3 text-gray-500" />}
              </button>

              {platformDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-[#1e1e24] backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl z-50 py-1 overflow-hidden max-h-80 overflow-y-auto slim-scrollbar">
                  {['Apple', 'Google Play', 'Windows', 'Steam'].map(category => (
                    <div key={category}>
                      <div className="px-3 py-1.5 text-[10px] uppercase text-gray-500 font-semibold bg-white/5">{category}</div>
                      {PLATFORM_PRESETS.filter(p => p.category === category).map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => handlePlatformChange(preset)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-white/5 transition ${selectedPlatform === preset.id ? 'text-blue-400 bg-blue-500/10' : 'text-gray-300'}`}
                        >
                          <span>{getPresetName(preset.id, preset.name)}</span>
                          <span className="text-[10px] text-gray-500 font-mono">{preset.width}×{preset.height}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                  {customSizePresets.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] uppercase text-gray-500 font-semibold bg-white/5">{t('categories.custom')}</div>
                      {customSizePresets.map(preset => (
                        <div key={preset.id} className="flex items-center group">
                          <button
                            onClick={() => handlePlatformChange(preset)}
                            className={`flex-1 flex items-center justify-between px-3 py-2 text-xs hover:bg-white/5 transition ${selectedPlatform === preset.id ? 'text-blue-400 bg-blue-500/10' : 'text-gray-300'}`}
                          >
                            <span>{preset.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono">{preset.width}×{preset.height}</span>
                          </button>
                          <button
                            onClick={() => deleteCustomSizePreset(preset.id)}
                            className="p-1 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded mr-1 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Canvas Size Display with Save Button - only show in screenshot mode */}
          {appMode === 'screenshot' && (
            <div className="relative flex items-center gap-2 text-xs h-8 px-3 bg-white/5 rounded-md border border-white/10">
              <span className="text-gray-500 font-mono">W:</span>
              <input type="number" className="bg-transparent w-10 text-gray-200 focus:outline-none text-center font-mono"
                value={globalSettings.width} onChange={(e) => setGlobalSettings(s => ({ ...s, width: parseInt(e.target.value) || 100 }))}
              />
              <span className="text-gray-600">×</span>
              <span className="text-gray-500 font-mono">H:</span>
              <input type="number" className="bg-transparent w-10 text-gray-200 focus:outline-none text-center font-mono"
                value={globalSettings.height} onChange={(e) => setGlobalSettings(s => ({ ...s, height: parseInt(e.target.value) || 100 }))}
              />
              <div className="w-px h-4 bg-white/10 mx-1"></div>
              <button
                onClick={() => setShowSavePresetModal(!showSavePresetModal)}
                className="p-1 text-gray-500 hover:text-blue-400 hover:bg-white/10 rounded transition"
                title="保存为预设"
              >
                <Save className="w-3.5 h-3.5" />
              </button>

              {/* Save Preset Dropdown */}
              {showSavePresetModal && (
                <div className="absolute top-full left-0 mt-1 bg-[#1e1e24] rounded-lg p-3 w-56 border border-white/10 shadow-xl z-50" ref={savePresetModalRef}>
                  <div className="text-xs text-gray-400 mb-2">{globalSettings.width}×{globalSettings.height}</div>
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="输入预设名称..."
                    className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-xs text-gray-200 mb-2"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveCustomSizePreset()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSavePresetModal(false)}
                      className="flex-1 px-2 py-1 text-[10px] text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition"
                    >
                      取消
                    </button>
                    <button
                      onClick={saveCustomSizePreset}
                      className="flex-1 px-2 py-1 text-[10px] text-white bg-blue-600 hover:bg-blue-500 rounded transition"
                    >
                      保存
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div> {/* Close Left Section */}

        {/* Center section with language toggle - only show in screenshot mode */}
        {appMode === 'screenshot' && (
          <div className="flex items-center gap-3 no-drag">
            {/* Language Preview Toggle */}
            <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 h-8 items-center">
              <button
                onClick={() => setPreviewLanguage('primary')}
                className={`h-full px-3 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${previewLanguage === 'primary' ? 'bg-[#1e1e24] text-white shadow-sm border border-white/5' : 'text-gray-400 hover:text-gray-200'}`}
              >
                <span className="text-[10px]">{LANGUAGES.find(l => l.code === globalSettings.primaryLang)?.flag}</span>
                {LANGUAGES.find(l => l.code === globalSettings.primaryLang)?.nativeName}
              </button>
              {globalSettings.secondaryLang !== 'none' && (
                <button
                  onClick={() => setPreviewLanguage('secondary')}
                  className={`h-full px-3 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${previewLanguage === 'secondary' ? 'bg-[#1e1e24] text-white shadow-sm border border-white/5' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  <span className="text-[10px]">{LANGUAGES.find(l => l.code === globalSettings.secondaryLang)?.flag}</span>
                  {LANGUAGES.find(l => l.code === globalSettings.secondaryLang)?.nativeName}
                </button>
              )}
            </div>

            {/* Language Settings Dropdown */}
            <div className="relative" ref={langSettingsRef}>
              <button
                onClick={() => setLangSettingsOpen(!langSettingsOpen)}
                className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition border border-white/10"
                title={t('scenes.languageSettings')}
              >
                <Globe className="w-4 h-4" />
              </button>

              {langSettingsOpen && (
                <div className="absolute top-full right-0 mt-1 w-72 bg-[#1e1e24] backdrop-blur-xl rounded-lg border border-white/10 shadow-2xl z-50 p-3 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="text-xs text-gray-400 font-semibold flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5" /> {t('scenes.languageSettings')}
                    </div>
                    <button
                      onClick={() => {
                        // Auto detect system language
                        const sysLangCode = navigator.language;
                        const matchedLang = LANGUAGES.find(l => l.code === sysLangCode || (sysLangCode.startsWith(l.code) && l.code !== 'none'))?.code || 'en';
                        setGlobalSettings(s => ({ ...s, primaryLang: matchedLang, secondaryLang: 'en' }));
                      }}
                      className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Monitor className="w-3 h-3" /> {t('scenes.followSystem')}
                    </button>
                  </div>

                  {/* Primary Language */}
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">{t('scenes.primaryLanguage')}</label>
                    <select
                      value={globalSettings.primaryLang}
                      onChange={(e) => setGlobalSettings(s => ({ ...s, primaryLang: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-xs text-gray-200"
                    >
                      {LANGUAGES.filter(l => l.code !== 'none').map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.flag} {lang.nativeName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Secondary Language */}
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">{t('scenes.translationLanguage')}</label>
                    <select
                      value={globalSettings.secondaryLang}
                      onChange={(e) => setGlobalSettings(s => ({ ...s, secondaryLang: e.target.value }))}
                      className="w-full bg-black/20 border border-white/10 rounded px-2 py-1.5 text-xs text-gray-200"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.flag} {lang.nativeName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="text-[9px] text-gray-600 pt-2 border-t border-white/5">
                    {t('scenes.noTranslationHint')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right section with export button - always show */}
        <div className="flex items-center gap-3 no-drag">
          <button onClick={handleExportAll}
            className="flex items-center gap-2 h-8 bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-md text-xs font-semibold transition shadow-lg shadow-blue-900/20 active:scale-95">
            <Download className="w-3.5 h-3.5" />
            {appMode === 'icon' ? t('header.exportIcon') : t('header.exportAll')}
          </button>

          {/* SETTINGS BUTTON */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition"
            title={t('header.settings')}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        initialTab={settingsInitialTab}
        globalSettings={globalSettings}
        setGlobalSettings={setGlobalSettings}
        appMode={appMode}
        setAppMode={setAppMode}
        theme={theme}
        setTheme={setTheme}
        glassEffect={glassEffect}
        setGlassEffect={setGlassEffect}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        type={confirmDialog.type}
      />

      {/* MAIN CONTENT AREA - Conditional rendering based on mode */}
      {
        appMode === 'icon' ? (
          <IconFabric />
        ) : (
          <div className="flex flex-1 overflow-hidden">

            {/* LEFT SIDEBAR */}
            <div className="w-80 border-r flex flex-col flex-shrink-0 z-20 shadow-xl sidebar-panel">

              {/* Ollama Settings */}
              <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase">
                    <Cpu className="w-3 h-3" /> {t('ollama.title')}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] ${ollamaConfig.isConnected ? 'text-green-500' : 'text-red-500'}`}>
                      {ollamaConfig.isConnected ? t('ollama.connected') : t('ollama.disconnected')}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${ollamaConfig.isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
                  </div>
                </div>

                {!ollamaConfig.isConnected ? (
                  <div className="space-y-2">
                    <input className="w-full text-xs bg-gray-800 border border-gray-700 rounded p-1 text-gray-300"
                      value={ollamaConfig.host} onChange={(e) => setOllamaConfig(s => ({ ...s, host: e.target.value }))}
                      placeholder="http://localhost:11434"
                    />
                    <button onClick={async () => {
                      await checkOllamaConnection();
                      // If still not connected after check, show guide
                      if (!ollamaConfig.isConnected) {
                        setShowOllamaGuide(true);
                      }
                    }}
                      className="w-full text-xs bg-blue-900/50 hover:bg-blue-800 text-blue-200 py-1.5 rounded border border-blue-800 transition flex items-center justify-center gap-1">
                      {t('ollama.connect')}
                    </button>

                    {/* Installation Guide - Shows when connection fails or user requests help */}
                    {showOllamaGuide && (
                      <div className="mt-2 p-3 bg-gray-800/80 rounded-lg border border-gray-700 text-xs text-gray-400 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-start gap-2 mb-2 text-amber-400/90">
                          <Monitor className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p className="leading-relaxed">
                            <span className="font-semibold text-amber-300">{t('ollama.recommended')}</span>
                            {t('ollama.recommendedDesc')}
                          </p>
                        </div>

                        <div className="space-y-2 pl-1">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold">1</div>
                            <a href="https://ollama.com/download" target="_blank" rel="noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                              {t('ollama.downloadInstall')}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold">2</div>
                            <span>{t('ollama.runApp')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold">3</div>
                            <span>{t('ollama.clickConnect')}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select className="w-full text-xs bg-gray-800 border border-gray-700 rounded p-1" value={ollamaConfig.model}
                      onChange={(e) => setOllamaConfig(s => ({ ...s, model: e.target.value }))}
                    >
                      {ollamaConfig.availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="autoTrans" checked={ollamaConfig.autoTranslate} onChange={(e) => setOllamaConfig(s => ({ ...s, autoTranslate: e.target.checked }))}
                      />
                      <label htmlFor="autoTrans" className="text-xs text-gray-400">{t('ollama.autoTranslateFilename')}</label>
                    </div>
                  </div>
                )}
              </div>

              {/* Background Settings */}
              <div className="p-4 border-b border-gray-800">
                <button
                  onClick={() => setBgExpanded(!bgExpanded)}
                  className="w-full text-xs uppercase text-gray-400 font-semibold mb-2 flex items-center gap-2 hover:text-gray-200 transition"
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${bgExpanded ? '' : '-rotate-90'}`} />
                  <ImageIcon className="w-4 h-4" /> {t('sidebar.globalBackground')}
                  {uploadedBackgrounds.length > 0 && (
                    <span className="ml-auto text-[10px] text-gray-500 font-normal">
                      {t('sidebar.imageCount').replace('{n}', uploadedBackgrounds.length)}
                    </span>
                  )}
                </button>

                {bgExpanded && (
                  <>
                    <div className="grid grid-cols-6 gap-2 mb-3">
                      {PRESETS.map(p => (
                        <button key={p.id} onClick={() => setGlobalSettings(s => ({ ...s, backgroundType: 'preset', backgroundValue: p.value }))}
                          className={`w-full h-8 rounded-md transition-all ${globalSettings.backgroundValue === p.value && globalSettings.backgroundType === 'preset' ? 'ring-2 ring-blue-500 scale-110 z-10' : 'opacity-70 hover:opacity-100'}`}
                          style={{ background: p.value }}
                          title={p.name}
                        />
                      ))}
                    </div>

                    {/* Built-in Background Images */}
                    <div className="mb-3">
                      <p className="text-[10px] text-gray-500 mb-2">{t('sidebar.builtinBackgrounds')}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {BUILTIN_BACKGROUNDS.map(bg => (
                          <button
                            key={bg.id}
                            onClick={() => setGlobalSettings(s => ({ ...s, backgroundType: 'builtin', backgroundUpload: bg.src }))}
                            className={`w-full h-12 rounded-md transition-all overflow-hidden ${globalSettings.backgroundUpload === bg.src && globalSettings.backgroundType === 'builtin' ? 'ring-2 ring-blue-500 scale-105' : 'opacity-70 hover:opacity-100'}`}
                            title={bg.name}
                          >
                            <img src={bg.src} alt={bg.name} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Uploaded Background Thumbnails */}
                    {uploadedBackgrounds.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] text-gray-500 mb-2">{t('sidebar.linkedBackgrounds')}</p>
                        <div className="grid grid-cols-5 gap-2">
                          {uploadedBackgrounds.slice(0, 10).map((bg, idx) => (
                            <div key={idx} className="relative group w-full h-8 rounded-md overflow-hidden">
                              <button
                                onClick={() => setGlobalSettings(s => ({ ...s, backgroundType: 'upload', backgroundUpload: bg.data }))}
                                className={`w-full h-full transition-all ${globalSettings.backgroundUpload === bg.data && globalSettings.backgroundType === 'upload' ? 'ring-2 ring-blue-500 scale-110 z-10' : 'opacity-70 group-hover:opacity-100'}`}
                                title={bg.name}
                              >
                                <img src={bg.data} alt={bg.name} className="w-full h-full object-cover" />
                              </button>

                              {/* Delete Button Overlay */}
                              <div
                                onClick={(e) => deleteUploadedBackground(idx, e)}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer z-20"
                                title={t('common.delete')}
                              >
                                <Trash2 className="w-4 h-4 text-white hover:text-red-400 transition-colors" />
                              </div>
                            </div>
                          ))}
                          {uploadedBackgrounds.length > 10 && (
                            <div className="w-full h-8 rounded-md bg-gray-800 flex items-center justify-center text-[10px] text-gray-500">
                              +{uploadedBackgrounds.length - 10}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleDirectoryBgUpload}
                      className={`flex items-center justify-center w-full p-2 text-xs bg-gray-800 rounded cursor-pointer hover:bg-gray-700 border border-gray-700 transition ${globalSettings.backgroundType === 'upload' ? 'border-blue-500 text-blue-400' : 'text-gray-400'}`}
                    >
                      <FolderInput className="w-3 h-3 mr-2" /> {t('sidebar.linkBackgroundFolder')}
                    </button>
                    {backgroundFolderPath && (
                      <p className="text-[9px] text-gray-500 mt-1 text-center font-mono truncate" title={backgroundFolderPath}>
                        {backgroundFolderPath.split('/').slice(-2).join('/')}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Scene List */}
              <div className="flex-1 overflow-y-auto p-4 slim-scrollbar sidebar-panel">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    {scenes.filter(s => s.screenshot).length > 0 && (
                      <input
                        type="checkbox"
                        checked={selectedSceneIds.size === scenes.filter(s => s.screenshot).length && scenes.filter(s => s.screenshot).length > 0}
                        onChange={toggleSelectAll}
                        className="rounded bg-gray-800 border-gray-700 text-blue-500 cursor-pointer"
                        title="全选/取消全选"
                      />
                    )}
                    <h3 className="text-xs uppercase text-gray-400 font-semibold">{t('scenes.sceneList')} ({scenes.filter(s => s.screenshot).length})</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* 批量删除按钮 */}
                    {selectedSceneIds.size > 0 && (
                      <button
                        onClick={deleteSelectedScenes}
                        className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded transition text-[10px] flex items-center gap-1"
                        title={`删除选中的 ${selectedSceneIds.size} 项`}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{selectedSceneIds.size}</span>
                      </button>
                    )}
                    {/* 导入按钮 - 使用 Electron 两步选择 */}
                    <button
                      onClick={handleElectronBatchUpload}
                      className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition shadow-lg shadow-blue-900/50"
                      title="导入截图（选择文件夹后选择文件）"
                    >
                      <FolderInput className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pb-20">
                  {/* 只显示有截图的场景，隐藏空截图占位 */}
                  {scenes.filter(scene => scene.screenshot).map(scene => (
                    <div key={scene.id} onClick={() => setActiveSceneId(scene.id)}
                      className={`group p-2 rounded-lg cursor-pointer flex items-center gap-3 border transition-all ${selectedSceneIds.has(scene.id) ? 'bg-blue-900/30 border-blue-500/50' : activeSceneId === scene.id ? 'bg-gray-800 border-blue-500/50 shadow-lg' : 'bg-gray-900 border-gray-800 hover:bg-gray-800 hover:border-gray-700'}`}
                    >
                      {/* 多选 Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedSceneIds.has(scene.id)}
                        onChange={(e) => toggleSceneSelection(scene.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded bg-gray-800 border-gray-700 text-blue-500 cursor-pointer flex-shrink-0"
                      />
                      <div className="w-8 h-12 bg-gray-950 rounded overflow-hidden flex-shrink-0 border border-gray-700 relative">
                        <img src={scene.screenshot} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${activeSceneId === scene.id ? 'text-white' : 'text-gray-400'}`}>{scene.name || t('scenes.unnamed')}</div>
                        <div className="text-[10px] text-gray-600 truncate">{scene.titleEN || '...'}</div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteScene(scene.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 text-gray-600 rounded transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {/* 如果没有有效截图，显示空状态提示 */}
                  {scenes.filter(s => s.screenshot).length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-xs">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>{t('scenes.emptyHint')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CENTER - Canvas Preview */}
            <div className="flex-1 flex flex-col relative preview-area">
              {/* Preview Area with Design Tips floating */}
              <div className="flex-1 overflow-hidden p-4 flex items-center justify-center relative" style={{ background: 'radial-gradient(circle at center, rgba(30,41,59,0.5) 0%, rgba(15,23,42,1) 100%)' }}>
                {/* Design Tips - 悬浮在预览区上方 */}
                {(() => {
                  const currentPreset = [...PLATFORM_PRESETS, ...customSizePresets].find(p => p.id === selectedPlatform);
                  if (currentPreset?.designTips?.length > 0) {
                    return (
                      <div className="absolute top-4 left-4 right-4 z-10">
                        <DesignTips tips={translateDesignTips(currentPreset.designTips)} mode={currentPreset.mode || 'poster'} />
                      </div>
                    );
                  }
                  return null;
                })()}
                {/* Canvas Container - Auto-fit */}
                <div className="relative shadow-2xl ring-1 ring-gray-700 rounded-lg overflow-hidden"
                  style={{
                    aspectRatio: `${globalSettings.width}/${globalSettings.height}`,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto'
                  }}
                >
                  <canvas ref={canvasRef} className="w-full h-full object-contain bg-gray-800 block" />
                  {/* Overlay Info */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[9px] text-gray-400 pointer-events-none">
                    {globalSettings.width} × {globalSettings.height}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR - Edit Active Scene */}
            <div className="w-72 border-l flex flex-col flex-shrink-0 shadow-xl z-20 no-scrollbar overflow-y-auto sidebar-panel">
              <div className="p-5 border-b border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-bold text-gray-100">{t('rightPanel.paramAdjust')}</h2>
                  <button onClick={applySettingsToAll} title={t('rightPanel.applyToAllHint')}
                    className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 bg-blue-900/20 hover:bg-blue-900/40 px-2 py-1 rounded transition border border-blue-900/50">
                    <Copy className="w-3 h-3" /> {t('rightPanel.applyToAll')}
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Saved Configs */}
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 mb-4">
                    <label className="text-[10px] uppercase text-gray-500 font-semibold mb-2 block flex items-center gap-2">
                      <Archive className="w-3 h-3" /> {t('rightPanel.layoutPresets')}
                    </label>
                    <div className="flex gap-1 mb-2">
                      <input
                        type="text"
                        value={configName}
                        onChange={(e) => setConfigName(e.target.value)}
                        placeholder={t('rightPanel.newPresetName')}
                        className="flex-1 min-w-0 bg-gray-900 text-xs border border-gray-700 rounded px-2 py-1"
                      />
                      <button onClick={saveConfig} className="p-1 bg-blue-900/50 text-blue-300 rounded border border-blue-800 hover:bg-blue-800"><Save className="w-3 h-3" /></button>
                    </div>
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {savedConfigs.map((config, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-gray-900/50 p-1 rounded group">
                          <span onClick={() => loadConfig(config)} className="text-gray-300 cursor-pointer hover:text-white flex-1 truncate">{config.name}</span>
                          <button onClick={() => deleteConfig(idx)} className="text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Screenshot Controls */}
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <label className="text-[10px] uppercase text-gray-500 font-semibold mb-2 block flex items-center gap-2">
                      <Settings className="w-3 h-3" /> {t('layout.title')}
                    </label>
                    <div className="space-y-3">
                      <div className="group">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                          {t('layout.scale')} <span>{Math.round(activeScene.settings.screenshotScale * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="range" min="0.3" max="3.0" step="0.01" value={activeScene.settings.screenshotScale}
                            onChange={(e) => updateSceneSettings('screenshotScale', parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                          <button onClick={() => resetSceneSetting('screenshotScale')} className="p-1 text-gray-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition"><RotateCcw className="w-3 h-3" /></button>
                        </div>
                      </div>
                      <div className="group">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">{t('layout.verticalPosition')} <span>{activeScene.settings.screenshotY}</span></div>
                        <div className="flex items-center gap-2">
                          <input type="range" min="0" max="1500" step="10" value={activeScene.settings.screenshotY} onChange={(e) =>
                            updateSceneSettings('screenshotY', parseInt(e.target.value))}
                            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                          <button onClick={() => resetSceneSetting('screenshotY')} className="p-1 text-gray-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition"><RotateCcw className="w-3 h-3" /></button>
                        </div>
                      </div>
                      <div className="group">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">{t('layout.horizontalPosition')} <span>{activeScene.settings.screenshotX}</span></div>
                        <div className="flex items-center gap-2">
                          <input type="range" min="-1000" max="1000" step="10" value={activeScene.settings.screenshotX}
                            onChange={(e) => updateSceneSettings('screenshotX', parseInt(e.target.value))}
                            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                          <button onClick={() => resetSceneSetting('screenshotX')} className="p-1 text-gray-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition"><RotateCcw className="w-3 h-3" /></button>
                        </div>
                      </div>
                      {/* Screenshot Shadow Toggle */}
                      <div className="pt-2 mt-2 border-t border-gray-700/50">
                        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeScene.settings.screenshotShadow !== false}
                            onChange={(e) => updateSceneSettings('screenshotShadow', e.target.checked)}
                            className="rounded bg-gray-800 border-gray-700 text-blue-500"
                          />
                          {t('layout.screenshotShadow')}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Settings */}
              <div className="p-5">
                <h3 className="text-[10px] uppercase text-gray-500 font-semibold mb-4 flex items-center gap-2">
                  <Type className="w-3 h-3" /> {t('text.title')}
                </h3>

                <div className="space-y-4">
                  {/* Global Text Controls */}
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase text-gray-500 font-semibold">对齐方式</span>
                      <div className="flex bg-gray-900 rounded-md p-0.5">
                        <button
                          onClick={() => setGlobalSettings(s => ({ ...s, textAlign: 'left' }))}
                          className={`p-1.5 rounded transition ${globalSettings.textAlign === 'left' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setGlobalSettings(s => ({ ...s, textAlign: 'center' }))}
                          className={`p-1.5 rounded transition ${globalSettings.textAlign === 'center' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setGlobalSettings(s => ({ ...s, textAlign: 'right' }))}
                          className={`p-1.5 rounded transition ${globalSettings.textAlign === 'right' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {/* Text Effects */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-700/50">
                      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={globalSettings.textShadow}
                          onChange={(e) => setGlobalSettings(s => ({ ...s, textShadow: e.target.checked }))}
                          className="rounded bg-gray-800 border-gray-700 text-blue-500"
                        />
                        {t('text.shadow')}
                      </label>
                      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={globalSettings.textStroke}
                          onChange={(e) => setGlobalSettings(s => ({ ...s, textStroke: e.target.checked }))}
                          className="rounded bg-gray-800 border-gray-700 text-blue-500"
                        />
                        {t('text.stroke')}
                      </label>
                    </div>
                    {/* Stroke Color - only show when stroke is enabled */}
                    {globalSettings.textStroke && (
                      <div className="mt-2">
                        <div className="text-[10px] text-gray-400 mb-1">{t('text.strokeColor')}</div>
                        <div className="flex gap-1.5">
                          {STROKE_COLORS.map(c => (
                            <button
                              key={c.id}
                              onClick={() => setGlobalSettings(s => ({ ...s, strokeColor: c.id }))}
                              className={`w-5 h-5 rounded-md border-2 transition ${globalSettings.strokeColor === c.id ? 'border-blue-500 scale-110' : 'border-gray-600 hover:border-gray-500'}`}
                              style={{ background: c.value }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Text Fade Control */}
                    <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-2">
                      <div className="text-[10px] text-gray-500 font-semibold">{t('text.gradientControl')}</div>
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">{t('text.fadePosition')} <span>{Math.round(globalSettings.fadeStart * 100)}%</span></div>
                        <input
                          type="range" min="0.3" max="1" step="0.05"
                          value={globalSettings.fadeStart}
                          onChange={(e) => setGlobalSettings(s => ({ ...s, fadeStart: parseFloat(e.target.value) }))}
                          className="w-full h-1 bg-gray-700 rounded-lg accent-blue-500"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">{t('text.bottomOpacity')} <span>{Math.round(globalSettings.fadeOpacity * 100)}%</span></div>
                        <input
                          type="range" min="0" max="1" step="0.05"
                          value={globalSettings.fadeOpacity}
                          onChange={(e) => setGlobalSettings(s => ({ ...s, fadeOpacity: parseFloat(e.target.value) }))}
                          className="w-full h-1 bg-gray-700 rounded-lg accent-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Chinese Title */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      {LANGUAGES.find(l => l.code === globalSettings.primaryLang)?.nativeName || '主标题'} (Primary)
                    </label>
                    <textarea
                      rows={2}
                      value={activeScene.titleCN}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        // 同步更新 name（去掉换行符显示在列表）
                        updateScene(activeScene.id, { titleCN: newTitle, name: newTitle.replace(/\n/g, ' ') });
                      }}
                      className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-gray-200 focus:border-blue-500 outline-none resize-none transition"
                      placeholder="支持多行文字..."
                    />
                  </div>

                  {/* English Title */}
                  <div className="relative">
                    <label className="block text-xs text-gray-400 mb-1 flex justify-between items-center">
                      <span>
                        {globalSettings.secondaryLang === 'none' ? '副标题 (可选)' : LANGUAGES.find(l => l.code === globalSettings.secondaryLang)?.nativeName} (Secondary)
                      </span>
                      <button
                        onClick={async () => {
                          const trans = await translateText(activeScene.titleCN, globalSettings.secondaryLang);
                          updateScene(activeScene.id, { titleEN: trans });
                        }}
                        disabled={!ollamaConfig.isConnected || globalSettings.secondaryLang === 'none'}
                        className={`text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded transition ${ollamaConfig.isConnected && globalSettings.secondaryLang !== 'none' ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                      >
                        <RefreshCw className="w-3 h-3" /> {t('text.reTranslate')}
                      </button>
                    </label>
                    <textarea
                      rows={2}
                      value={activeScene.titleEN}
                      onChange={(e) => updateScene(activeScene.id, { titleEN: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-gray-200 focus:border-blue-500 outline-none resize-none transition"
                      placeholder="Supports multiple lines..."
                    />
                  </div>

                  {/* 主语言文字样式 - 只在预览主语言时显示 */}
                  {previewLanguage === 'primary' && (
                    <div className="pt-4 border-t border-gray-800">
                      <h4 className="text-[10px] uppercase text-blue-400 font-semibold mb-3">
                        {LANGUAGES.find(l => l.code === globalSettings.primaryLang)?.nativeName || t('text.primaryStyle')} {t('text.primaryStyle')}
                      </h4>
                      <div className="space-y-3">
                        {/* Font Selection */}
                        <div>
                          <div className="text-[10px] text-gray-400 mb-1">{t('text.font')}</div>
                          <select
                            value={globalSettings.fontCN}
                            onChange={(e) => setGlobalSettings(s => ({ ...s, fontCN: e.target.value }))}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200"
                          >
                            {FONTS_CN.map(f => <option key={f.id} value={f.value}>{getFontName(f.id, f.name)}</option>)}
                          </select>
                        </div>
                        {/* Color Selection */}
                        <div>
                          <div className="text-[10px] text-gray-400 mb-1">{t('text.color')}</div>
                          <div className="flex gap-1.5 flex-wrap">
                            {TEXT_COLORS.map(c => (
                              <button
                                key={c.id}
                                onClick={() => setGlobalSettings(s => ({ ...s, textColorCN: c.id }))}
                                className={`w-6 h-6 rounded-md border-2 transition ${globalSettings.textColorCN === c.id ? 'border-blue-500 scale-110' : 'border-gray-700 hover:border-gray-500'}`}
                                style={{ background: c.gradient ? `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})` : c.value }}
                                title={c.name}
                              />
                            ))}
                          </div>
                        </div>
                        {/* Size */}
                        <div className="group">
                          <div className="flex justify-between text-[10px] text-gray-400 mb-1">{t('text.fontSize')} <span>{activeScene.settings.textSizeCN}</span></div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range" min="40" max="300" step="5"
                              value={activeScene.settings.textSizeCN}
                              onChange={(e) => updateSceneSettings('textSizeCN', parseInt(e.target.value))}
                              className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <button onClick={() => resetSceneSetting('textSizeCN')} className="p-1 text-gray-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition"><RotateCcw className="w-3 h-3" /></button>
                          </div>
                        </div>
                        {/* Y Position */}
                        <div className="group">
                          <div className="flex justify-between text-[10px] text-gray-400 mb-1">{t('layout.verticalPosition')} <span>{activeScene.settings.textYCN}</span></div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range" min="50" max="1000" step="10"
                              value={activeScene.settings.textYCN}
                              onChange={(e) => updateSceneSettings('textYCN', parseInt(e.target.value))}
                              className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <button onClick={() => resetSceneSetting('textYCN')} className="p-1 text-gray-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition"><RotateCcw className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* 副语言文字样式 - 只在预览副语言时显示 */}
                  {previewLanguage === 'secondary' && globalSettings.secondaryLang !== 'none' && (
                    <div className="pt-4 border-t border-gray-800">
                      <h4 className="text-[10px] uppercase text-blue-400 font-semibold mb-3">
                        {LANGUAGES.find(l => l.code === globalSettings.secondaryLang)?.nativeName || '副标题'} 样式
                      </h4>
                      <div className="space-y-3">
                        {/* Font Selection */}
                        <div>
                          <div className="text-[10px] text-gray-400 mb-1">Font</div>
                          <select
                            value={globalSettings.fontEN}
                            onChange={(e) => setGlobalSettings(s => ({ ...s, fontEN: e.target.value }))}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200"
                          >
                            {FONTS_EN.map(f => <option key={f.id} value={f.value}>{f.name}</option>)}
                          </select>
                        </div>
                        {/* Uppercase Option */}
                        <div>
                          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={globalSettings.textUppercase}
                              onChange={(e) => setGlobalSettings(s => ({ ...s, textUppercase: e.target.checked }))}
                              className="rounded bg-gray-800 border-gray-700 text-blue-500"
                            />
                            全部大写 (UPPERCASE)
                          </label>
                        </div>
                        {/* Color Selection */}
                        <div>
                          <div className="text-[10px] text-gray-400 mb-1">Color</div>
                          <div className="flex gap-1.5 flex-wrap">
                            {TEXT_COLORS.map(c => (
                              <button
                                key={c.id}
                                onClick={() => setGlobalSettings(s => ({ ...s, textColorEN: c.id }))}
                                className={`w-6 h-6 rounded-md border-2 transition ${globalSettings.textColorEN === c.id ? 'border-blue-500 scale-110' : 'border-gray-700 hover:border-gray-500'}`}
                                style={{ background: c.gradient ? `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})` : c.value }}
                                title={c.name}
                              />
                            ))}
                          </div>
                        </div>
                        {/* Size */}
                        <div className="group">
                          <div className="flex justify-between text-[10px] text-gray-400 mb-1">字体大小 <span>{activeScene.settings.textSizeEN}</span></div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range" min="40" max="300" step="5"
                              value={activeScene.settings.textSizeEN}
                              onChange={(e) => updateSceneSettings('textSizeEN', parseInt(e.target.value))}
                              className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <button onClick={() => resetSceneSetting('textSizeEN')} className="p-1 text-gray-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition"><RotateCcw className="w-3 h-3" /></button>
                          </div>
                        </div>
                        {/* Y Position */}
                        <div className="group">
                          <div className="flex justify-between text-[10px] text-gray-400 mb-1">垂直位置 (Y) <span>{activeScene.settings.textYEN}</span></div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range" min="50" max="1000" step="10"
                              value={activeScene.settings.textYEN}
                              onChange={(e) => updateSceneSettings('textYEN', parseInt(e.target.value))}
                              className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <button onClick={() => resetSceneSetting('textYEN')} className="p-1 text-gray-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition"><RotateCcw className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div >
        )}

      {/* 底部进度条 */}
      {
        importProgress.active && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-2 z-50">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{importProgress.message}</span>
                  <span>{importProgress.current} / {importProgress.total}</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default App;

