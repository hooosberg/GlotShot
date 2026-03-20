import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon, Type, FolderInput, Plus, Trash2, Globe, Settings, Copy, RefreshCw, Cpu, Monitor, RotateCcw, Save, Archive, ChevronDown, ChevronUp, AlignLeft, AlignCenter, AlignRight, Palette, Smartphone, Layers, CheckSquare, X, ArrowRight } from 'lucide-react';
import './App.css';
import useClickOutside from './hooks/useClickOutside';
import IconFabric from './components/IconFabric/IconFabric';
import SettingsModal from './components/SettingsModal';
import ExportProgressModal from './components/ExportProgressModal';
import DesignTips from './components/DesignTips';
import { useTranslation, I18nProvider, detectSystemLanguage } from './locales/i18n';
import ConfirmDialog from './components/ConfirmDialog';
import { translations } from './locales/translations';
import DeviceMockup, {
  DEVICE_CONFIGS,
  generateDeviceFrameSVG,
  generateLockScreenUI,
  svgToImage,
  loadSvgContent,
  modifySvgLayers,
  extractSvgLayer,
  loadDeviceSvgLayers,
} from './components/DeviceMockup';

// Default constants
const DEFAULT_WIDTH = 2880;
const DEFAULT_HEIGHT = 1800;
const DEFAULT_TRANSLATION_LANGUAGE = 'en';
const TRANSLATION_TIMEOUT_MS = 10000;
const OLLAMA_CONNECT_TIMEOUT_MS = 3000;
const CENTER_SNAP_THRESHOLD = 18;
const INITIAL_IMPORT_PROGRESS = {
  active: false,
  phase: 'idle',
  status: 'idle',
  current: 0,
  total: 0,
  message: '',
  detail: '',
  successCount: 0,
  failedCount: 0,
  skippedCount: 0
};

// Built-in backgrounds - 渐变配色
const PRESETS = [
  // Row 1: Light & Neutrals
  { id: 'titanium-white', name: '钛金白', value: 'linear-gradient(180deg, #FFFFFF 0%, #F2F2F7 100%)' },
  { id: 'starlight', name: '星光色', value: 'linear-gradient(180deg, #Fbfbfd 0%, #e8e6e1 100%)' },
  { id: 'natural-titanium', name: '原色钛', value: 'linear-gradient(180deg, #Bdbcb7 0%, #8f8e89 100%)' },
  { id: 'silver', name: '银色', value: 'linear-gradient(180deg, #ececed 0%, #d1d1d6 100%)' },
  { id: 'space-gray', name: '深空灰', value: 'linear-gradient(180deg, #48484a 0%, #2c2c2e 100%)' },
  { id: 'midnight', name: '午夜色', value: 'linear-gradient(180deg, #262a34 0%, #15181e 100%)' },
  // Row 2: Colorful Premium
  { id: 'blue-titanium', name: '钛蓝', value: 'linear-gradient(180deg, #2f384b 0%, #18202f 100%)' },
  { id: 'pacific-blue', name: '海蓝色', value: 'linear-gradient(180deg, #375368 0%, #1c2b36 100%)' },
  { id: 'alpine-green', name: '苍岭绿', value: 'linear-gradient(180deg, #495a4c 0%, #29332b 100%)' },
  { id: 'deep-purple', name: '暗夜紫', value: 'linear-gradient(180deg, #534556 0%, #322934 100%)' },
  { id: 'rose-gold', name: '玫瑰金', value: 'linear-gradient(180deg, #fadadd 0%, #f4b4ba 100%)' },
  { id: 'sunrise', name: '晨曦', value: 'linear-gradient(180deg, #ffecd2 0%, #fcb69f 100%)' },
];

// 内置背景图片 (public/背景/)
const BUILTIN_BACKGROUNDS = [
  { id: 'builtin1', name: '金色', src: './背景/金色.jpg' },
  { id: 'builtin2', name: '壁纸', src: './背景/wallpaper003.jpg' },
  { id: 'builtin3', name: '渐变', src: './背景/ChatGPT Image 2025年6月2日 12_55_05.jpg' },
  { id: 'builtin4', name: '海纹', src: './背景/Gemini_Generated_Image_eecq6reecq6reecq.jpg' },
  { id: 'builtin5', name: '沙丘', src: './背景/Gemini_Generated_Image_qukbslqukbslqukb.jpg' },
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
  { id: 'classic-black', name: '经典黑', value: '#000000' },
  { id: 'deep-gray', name: '深枪灰', value: '#374151' },
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
  screenshotScale: 0.85,
  screenshotY: 500,
  screenshotX: 0,
  screenshotShadow: true, // 截图阴影开关
  // 中文文字设置
  textXCN: 0,
  textYCN: 180,
  textSizeCN: 110,
  // 英文文字设置
  textXEN: 0,
  textYEN: 180,
  textSizeEN: 90,
  // 按设备存储的配置 { [deviceId]: { scale, x, y, frameColor, showUI, showShadow, shadowOpacity } }
  deviceConfigs: {},
};

const CJK_LANGUAGE_CODES = ['zh-CN', 'zh-TW', 'ja', 'ko'];

const getLanguageInfo = (langCode) => LANGUAGES.find(lang => lang.code === langCode);

const isCjkLanguage = (langCode) => CJK_LANGUAGE_CODES.includes(langCode);

const getFontOptionsForLanguage = (langCode) => (
  isCjkLanguage(langCode) ? FONTS_CN : FONTS_EN
);

const getDefaultFontForLanguage = (langCode) => getFontOptionsForLanguage(langCode)[0].value;

const normalizeSecondaryLangs = (primaryLang, secondaryLangs, legacySecondaryLang = 'none') => {
  const rawLangs = Array.isArray(secondaryLangs)
    ? secondaryLangs
    : (secondaryLangs ? [secondaryLangs] : []);

  const mergedLangs = rawLangs.length > 0
    ? rawLangs
    : (legacySecondaryLang && legacySecondaryLang !== 'none' ? [legacySecondaryLang] : []);

  return [...new Set(
    mergedLangs.filter(lang => lang && lang !== 'none' && lang !== primaryLang)
  )];
};

const App = () => {
  // useTranslation hook provides language and changeLanguage
  const { t, language, changeLanguage } = useTranslation();

  // Translation mapping for preset names
  const PRESET_NAME_MAP = {
    'iphone-6.9': 'presets.iphone69ProMax',
    'iphone-6.7': 'presets.iphone67',
    'iphone-6.5': 'presets.iphone65',
    'iphone-5.5': 'presets.iphone55',
    'ipad-13': 'presets.ipad13M4',
    'ipad-12.9': 'presets.ipad129',
    'ipad-11': 'presets.ipad11',
    mac: 'presets.macAppStore',
    'android-phone': 'presets.phoneScreenshot',
    'android-tablet': 'presets.tabletScreenshot',
    'android-feature': 'presets.featureGraphic',
    'windows-hd': 'presets.desktop1920',
    'windows-min': 'presets.desktop1366',
    'windows-4k': 'presets.desktop4k',
    'steam': 'presets.steamScreenshot',
    'steam-capsule': 'presets.steamCapsule',
  };

  const PLATFORM_CATEGORY_MAP = {
    Apple: 'categories.apple',
    'Google Play': 'categories.googlePlay',
    Windows: 'categories.windows',
    Steam: 'categories.steam',
  };

  const BACKGROUND_PRESET_NAME_MAP = {
    'titanium-white': 'catalog.backgroundPresets.titanium-white',
    starlight: 'catalog.backgroundPresets.starlight',
    'natural-titanium': 'catalog.backgroundPresets.natural-titanium',
    silver: 'catalog.backgroundPresets.silver',
    'space-gray': 'catalog.backgroundPresets.space-gray',
    midnight: 'catalog.backgroundPresets.midnight',
    'blue-titanium': 'catalog.backgroundPresets.blue-titanium',
    'pacific-blue': 'catalog.backgroundPresets.pacific-blue',
    'alpine-green': 'catalog.backgroundPresets.alpine-green',
    'deep-purple': 'catalog.backgroundPresets.deep-purple',
    'rose-gold': 'catalog.backgroundPresets.rose-gold',
    sunrise: 'catalog.backgroundPresets.sunrise',
  };

  const BUILTIN_BACKGROUND_NAME_MAP = {
    builtin1: 'catalog.builtinBackgrounds.builtin1',
    builtin2: 'catalog.builtinBackgrounds.builtin2',
    builtin3: 'catalog.builtinBackgrounds.builtin3',
    builtin4: 'catalog.builtinBackgrounds.builtin4',
    builtin5: 'catalog.builtinBackgrounds.builtin5',
  };

  const TEXT_COLOR_NAME_MAP = {
    white: 'catalog.textColors.white',
    'neon-pink': 'catalog.textColors.neon-pink',
    'apple-blue': 'catalog.textColors.apple-blue',
    'mint-green': 'catalog.textColors.mint-green',
    'rose-gold': 'catalog.textColors.rose-gold',
    'sunset-orange': 'catalog.textColors.sunset-orange',
    'gradient-blue': 'catalog.textColors.gradient-blue',
    'gradient-purple': 'catalog.textColors.gradient-purple',
    'gradient-gold': 'catalog.textColors.gradient-gold',
    'classic-black': 'catalog.textColors.classic-black',
    'deep-gray': 'catalog.textColors.deep-gray',
  };

  const STROKE_COLOR_NAME_MAP = {
    black: 'catalog.strokeColors.black',
    'dark-gray': 'catalog.strokeColors.dark-gray',
    white: 'catalog.strokeColors.white',
    blue: 'catalog.strokeColors.blue',
    purple: 'catalog.strokeColors.purple',
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
    return originalName;
  };

  const getPlatformCategoryName = (category) => {
    const translationKey = PLATFORM_CATEGORY_MAP[category];
    return translationKey ? t(translationKey) : category;
  };

  const getBackgroundPresetName = (presetId, originalName) => {
    const translationKey = BACKGROUND_PRESET_NAME_MAP[presetId];
    return translationKey ? t(translationKey) : originalName;
  };

  const getBuiltinBackgroundName = (backgroundId, originalName) => {
    const translationKey = BUILTIN_BACKGROUND_NAME_MAP[backgroundId];
    return translationKey ? t(translationKey) : originalName;
  };

  // Get translated font name
  const getFontName = (fontId, originalName) => {
    const translationKey = FONT_NAME_MAP[fontId];
    if (translationKey) {
      return t(translationKey);
    }
    return originalName;
  };

  const getTextColorName = (colorId, originalName) => {
    const translationKey = TEXT_COLOR_NAME_MAP[colorId];
    return translationKey ? t(translationKey) : originalName;
  };

  const getStrokeColorName = (colorId, originalName) => {
    const translationKey = STROKE_COLOR_NAME_MAP[colorId];
    return translationKey ? t(translationKey) : originalName;
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
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [globalSettings, setGlobalSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('appstore_builder_global');
      if (saved) {
        const baseSettings = {
          ...{
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            backgroundType: 'preset',
            backgroundValue: PRESETS[0].value,
            backgroundUpload: null,
            // Background Transform
            backgroundScale: 1.0,
            backgroundX: 0,
            backgroundY: 0,
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
            strokeWidth: 4,
            strokeOpacity: 1.0,
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
            secondaryLangs: [DEFAULT_TRANSLATION_LANGUAGE],
            secondaryLang: 'en',
            ollamaHost: 'http://localhost:11434',
            autoTranslate: true,
            uiLanguage: (() => {
              try {
                const sys = navigator.language;
                return sys.startsWith('zh') ? 'zh-CN' : 'en';
              } catch { return 'zh-CN'; }
            })(),
          }, ...JSON.parse(saved)
        };

        const secondaryLangs = normalizeSecondaryLangs(
          baseSettings.primaryLang,
          baseSettings.secondaryLangs,
          baseSettings.secondaryLang
        );

        return {
          ...baseSettings,
          secondaryLangs,
          secondaryLang: secondaryLangs[0] || 'none'
        };
      }
    } catch { }
    return {
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      backgroundType: 'preset',
      backgroundValue: PRESETS[0].value,
      backgroundUpload: null,
      // Background Transform
      backgroundScale: 1.0,
      backgroundX: 0,
      backgroundY: 0,
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
      secondaryLangs: [DEFAULT_TRANSLATION_LANGUAGE],
      secondaryLang: 'en',
      ollamaHost: 'http://localhost:11434',
      autoTranslate: true,
      uiLanguage: 'zh-CN',
    };
  });

  // Uploaded backgrounds - stored in localStorage as base64
  const [uploadedBackgrounds, setUploadedBackgrounds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('appstore_builder_backgrounds')) || [];
    } catch { return []; }
  });

  // Theme Settings - Dark, Light, Sepia
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'dark';
  });

  // Glass Effect Settings
  const [glassEffect, setGlassEffect] = useState(() => {
    return localStorage.getItem('app_glass_effect') !== 'false';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-glass', glassEffect);
    localStorage.setItem('app_glass_effect', glassEffect);
  }, [glassEffect]);

  const [backgroundFolderPath, setBackgroundFolderPath] = useState('');

  // UI state for collapsible sections
  const [bgExpanded, setBgExpanded] = useState(true);
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
  const [primaryLanguageMenuOpen, setPrimaryLanguageMenuOpen] = useState(false);
  const [translationLanguageMenuOpen, setTranslationLanguageMenuOpen] = useState(false);

  // Export Progress State
  const [exportProgress, setExportProgress] = useState({ active: false, current: 0, total: 0, message: '', status: 'generating' }); // status: generating, saving, completed, cancelled, error
  const isExportCancelled = useRef(false);

  const handleCancelExport = () => {
    isExportCancelled.current = true;
    setExportProgress(prev => ({ ...prev, status: 'cancelled', message: t('export.cancelling') }));
  };

  const closeExportModal = () => {
    setExportProgress({ active: false, current: 0, total: 0, message: '', status: 'generating' });
  };

  // App mode: 'screenshot' for screenshot builder, 'icon' for icon factory
  const [appMode, setAppMode] = useState(() => {
    return localStorage.getItem('glotshot-app-mode') || 'screenshot';
  });
  const [selectedPlatform, setSelectedPlatform] = useState('mac');

  // 保存appMode到localStorage
  useEffect(() => {
    localStorage.setItem('glotshot-app-mode', appMode);
  }, [appMode]);

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

  // Device Mockup State
  const [mockupEnabled, setMockupEnabled] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('appstore_builder_mockup_enabled')) || false;
    } catch { return false; }
  });
  const [selectedDevice, setSelectedDevice] = useState(() => {
    try {
      return localStorage.getItem('appstore_builder_selected_device') || 'iphone-17-pro-max';
    } catch { return 'iphone-17-pro-max'; }
  });
  const [deviceFrameColor, setDeviceFrameColor] = useState(() => {
    try {
      return localStorage.getItem('appstore_builder_frame_color') || '#1C1C1E';
    } catch { return '#1C1C1E'; }
  });
  const [showLockScreenUI, setShowLockScreenUI] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('appstore_builder_lockscreen_ui')) || false;
    } catch { return false; }
  });
  const [showMockupShadow, setShowMockupShadow] = useState(() => {
    try {
      const saved = localStorage.getItem('appstore_builder_mockup_shadow');
      return saved !== null ? JSON.parse(saved) : true;
    } catch { return true; }
  });
  const [shadowOpacity, setShadowOpacity] = useState(() => {
    try {
      const saved = localStorage.getItem('appstore_builder_shadow_opacity');
      return saved !== null ? parseFloat(saved) : 0.5;
    } catch { return 0.5; }
  });

  // Device scale, position, and orientation
  const [deviceScale, setDeviceScale] = useState(() => {
    try {
      return parseFloat(localStorage.getItem('appstore_builder_device_scale')) || 1.0;
    } catch { return 1.0; }
  });
  const [deviceX, setDeviceX] = useState(() => {
    try {
      return parseInt(localStorage.getItem('appstore_builder_device_x')) || 0;
    } catch { return 0; }
  });
  const [deviceY, setDeviceY] = useState(() => {
    try {
      return parseInt(localStorage.getItem('appstore_builder_device_y')) || 400;
    } catch { return 400; }
  });
  // Screen dimensions
  const [iPadLandscape, setiPadLandscape] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('appstore_builder_ipad_landscape')) !== false;
    } catch { return true; } // Default to landscape
  });

  // 缓存的设备图层，避免每次绘制都重复解析 SVG 导致卡顿
  const [deviceLayers, setDeviceLayers] = useState(null);

  // 当设备配置改变时重新加载图层
  useEffect(() => {
    let isMounted = true;

    // 如果没有启用设备套壳，不需要加载
    if (!mockupEnabled) {
      setDeviceLayers(null);
      return;
    }

    const loadLayers = async () => {
      const config = DEVICE_CONFIGS[selectedDevice];
      if (!config) return;

      if (config.useSvgLayers && config.svgPath) {
        try {
          const layers = await loadDeviceSvgLayers(
            config.svgPath,
            {
              frameColor: deviceFrameColor,
              showUI: showLockScreenUI,
              showShadow: true, // 始终加载投影图层，绘制时由 showMockupShadow 控制
              deviceConfig: config,
            }
          );
          if (isMounted) {
            setDeviceLayers(layers);
          }
        } catch (e) {
          console.warn('Failed to load SVG layers:', e);
        }
      } else {
        if (isMounted) setDeviceLayers(null);
      }
    };

    loadLayers();

    return () => { isMounted = false; };
  }, [mockupEnabled, selectedDevice, deviceFrameColor, showLockScreenUI]); // 注意：showMockupShadow 改变不需要重新加载图层，只影响绘制可见性



  // Persist Device Mockup settings
  useEffect(() => {
    localStorage.setItem('appstore_builder_mockup_enabled', JSON.stringify(mockupEnabled));
  }, [mockupEnabled]);
  useEffect(() => {
    localStorage.setItem('appstore_builder_selected_device', selectedDevice);
  }, [selectedDevice]);
  useEffect(() => {
    localStorage.setItem('appstore_builder_frame_color', deviceFrameColor);
  }, [deviceFrameColor]);
  useEffect(() => {
    localStorage.setItem('appstore_builder_lockscreen_ui', JSON.stringify(showLockScreenUI));
  }, [showLockScreenUI]);
  useEffect(() => {
    localStorage.setItem('appstore_builder_device_scale', deviceScale.toString());
  }, [deviceScale]);
  useEffect(() => {
    localStorage.setItem('appstore_builder_device_x', deviceX.toString());
  }, [deviceX]);
  useEffect(() => {
    localStorage.setItem('appstore_builder_device_y', deviceY.toString());
  }, [deviceY]);
  useEffect(() => {
    localStorage.setItem('appstore_builder_mockup_shadow', JSON.stringify(showMockupShadow));
    localStorage.setItem('appstore_builder_shadow_opacity', shadowOpacity.toString());
  }, [showMockupShadow, shadowOpacity, deviceLayers]);

  // Listen for IPC events from Main Process
  useEffect(() => {
    if (window.electron) {
      const unsubs = [];

      unsubs.push(window.electron.on('show-settings', () => {
        setSettingsInitialTab('start');
        setShowSettingsModal(true);
      }));

      unsubs.push(window.electron.on('show-about', () => {
        setSettingsInitialTab('about');
        setShowSettingsModal(true);
      }));

      unsubs.push(window.electron.on('menu-mode-screenshot', () => setAppMode('screenshot')));
      unsubs.push(window.electron.on('menu-mode-icon', () => setAppMode('icon')));

      // Import
      unsubs.push(window.electron.on('menu-import', () => handleElectronBatchUpload()));

      // Export - Match the UI dropdown options
      unsubs.push(window.electron.on('menu-export-language', () => handleExportAll()));
      unsubs.push(window.electron.on('menu-export-device', () => handleExportByDevice()));

      // Cleanup
      return () => {
        unsubs.forEach(unsub => unsub && unsub());
      };
    }
  }, []); // eslint-disable-line
  // Refs for click outside
  const platformDropdownRef = useRef(null);
  const primaryLanguageMenuRef = useRef(null);
  const translationLanguageMenuRef = useRef(null);
  const savePresetModalRef = useRef(null);

  useClickOutside(platformDropdownRef, () => setPlatformDropdownOpen(false));
  useClickOutside(primaryLanguageMenuRef, () => setPrimaryLanguageMenuOpen(false));
  useClickOutside(translationLanguageMenuRef, () => setTranslationLanguageMenuOpen(false));
  useClickOutside(savePresetModalRef, () => setShowSavePresetModal(false));

  // Sync Menu Language
  useEffect(() => {
    if (window.electron && translations[language] && translations[language].menu) {
      if (window.electron.updateMenuLanguage) {
        window.electron.updateMenuLanguage(translations[language].menu);
      }
    }
  }, [language]);

  // Persist globalSettings to localStorage
  useEffect(() => {
    // 移除之前的解构，直接保存所有设置，包括 backgroundUpload
    // 注意：如果是超大图片可能会导致 localStorage 满，但对于单张当前背景通常没问题
    // 且已有的 uploadedBackgrounds 已经占用了空间，这里只是存一份当前引用的
    localStorage.setItem('appstore_builder_global', JSON.stringify(globalSettings));
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

  const closeTopbarOverlays = useCallback(() => {
    setPlatformDropdownOpen(false);
    setPrimaryLanguageMenuOpen(false);
    setTranslationLanguageMenuOpen(false);
    setShowSavePresetModal(false);
    setExportMenuOpen(false);
  }, []);

  const handleTopbarBlankInteraction = useCallback((event, onClose = closeTopbarOverlays) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [closeTopbarOverlays]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeTopbarOverlays();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeTopbarOverlays]);


  // Ollama Settings
  const [ollamaConfig, setOllamaConfig] = useState({
    host: globalSettings.ollamaHost || 'http://localhost:11434',
    model: '',
    availableModels: [],
    isConnected: false,
    autoTranslate: globalSettings.autoTranslate ?? true
  });
  const [showOllamaGuide, setShowOllamaGuide] = useState(false);
  const [isRetranslating, setIsRetranslating] = useState(false);
  const [isBatchRetranslating, setIsBatchRetranslating] = useState(false);
  const selectedSecondaryLangs = normalizeSecondaryLangs(
    globalSettings.primaryLang,
    globalSettings.secondaryLangs,
    globalSettings.secondaryLang
  );
  const selectedSecondaryLangsKey = selectedSecondaryLangs.join('|');
  const allConfiguredLanguageCodes = [globalSettings.primaryLang, ...selectedSecondaryLangs];

  const resolveCanvasLanguageCode = (languageCode) => {
    if (!languageCode || languageCode === 'primary' || languageCode === 'CN') {
      return globalSettings.primaryLang;
    }
    if (languageCode === 'secondary' || languageCode === 'EN') {
      return selectedSecondaryLangs[0] || globalSettings.primaryLang;
    }
    return languageCode;
  };

  const getSceneTitleByLanguage = (scene, languageCode) => {
    if (!scene || !languageCode) return '';

    const titles = scene.titles || {};
    if (Object.prototype.hasOwnProperty.call(titles, languageCode)) {
      return titles[languageCode] || '';
    }

    if (languageCode === globalSettings.primaryLang) {
      return scene.titleCN || '';
    }

    const firstSecondaryLang = selectedSecondaryLangs[0];
    if (firstSecondaryLang && languageCode === firstSecondaryLang) {
      return scene.titleEN || '';
    }

    return '';
  };

  const buildSceneTitleUpdate = (scene, languageCode, value) => {
    const nextTitles = {
      ...(scene?.titles || {}),
      [languageCode]: value
    };
    const updates = { titles: nextTitles };

    if (languageCode === globalSettings.primaryLang) {
      updates.titleCN = value;
    }

    if (selectedSecondaryLangs[0] && languageCode === selectedSecondaryLangs[0]) {
      updates.titleEN = value;
    }

    return updates;
  };

  const getSceneLanguageStyle = (scene, languageCode) => {
    const resolvedLanguageCode = resolveCanvasLanguageCode(languageCode);
    const style = scene?.settings?.languageStyles?.[resolvedLanguageCode] || {};
    const isPrimaryLanguage = resolvedLanguageCode === globalSettings.primaryLang;

    return {
      textX: style.textX ?? (isPrimaryLanguage
        ? (scene?.settings?.textXCN ?? DEFAULT_SCENE_SETTINGS.textXCN)
        : (scene?.settings?.textXEN ?? DEFAULT_SCENE_SETTINGS.textXEN)),
      textY: style.textY ?? (isPrimaryLanguage
        ? (scene?.settings?.textYCN ?? DEFAULT_SCENE_SETTINGS.textYCN)
        : (scene?.settings?.textYEN ?? DEFAULT_SCENE_SETTINGS.textYEN)),
      textSize: style.textSize ?? (isPrimaryLanguage
        ? (scene?.settings?.textSizeCN ?? DEFAULT_SCENE_SETTINGS.textSizeCN)
        : (scene?.settings?.textSizeEN ?? DEFAULT_SCENE_SETTINGS.textSizeEN))
    };
  };

  const getGlobalLanguageStyle = (languageCode) => {
    const resolvedLanguageCode = resolveCanvasLanguageCode(languageCode);
    const style = globalSettings.languageTextStyles?.[resolvedLanguageCode] || {};
    const isPrimaryLanguage = resolvedLanguageCode === globalSettings.primaryLang;

    return {
      font: style.font ?? (isPrimaryLanguage
        ? (globalSettings.fontCN || getDefaultFontForLanguage(resolvedLanguageCode))
        : (globalSettings.fontEN || getDefaultFontForLanguage(resolvedLanguageCode))),
      textColor: style.textColor ?? (isPrimaryLanguage
        ? (globalSettings.textColorCN || TEXT_COLORS[0].id)
        : (globalSettings.textColorEN || TEXT_COLORS[0].id)),
      uppercase: style.uppercase ?? (!isPrimaryLanguage && Boolean(globalSettings.textUppercase))
    };
  };

  const createSceneTitles = (baseText = '', existingScene = null) => {
    const nextTitles = {
      ...(existingScene?.titles || {}),
      [globalSettings.primaryLang]: getSceneTitleByLanguage(existingScene, globalSettings.primaryLang) || baseText
    };

    selectedSecondaryLangs.forEach(languageCode => {
      nextTitles[languageCode] = getSceneTitleByLanguage(existingScene, languageCode) || baseText;
    });

    return nextTitles;
  };

  const getDefaultSceneName = (id = 1) => `${t('scenes.scene')} ${id}`;

  const createBlankScene = (id = 1, name = getDefaultSceneName(id)) => ({
    id,
    screenshot: null,
    name,
    titleCN: '',
    titleEN: '',
    titles: createSceneTitles(''),
    settings: { ...DEFAULT_SCENE_SETTINGS }
  });

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
      name: t('scenes.homeShowcase'),
      screenshot: null,
      titleCN: t('scenes.defaultTitle'),
      titleEN: t('scenes.defaultTitleEN'),
      titles: {
        [globalSettings.primaryLang]: t('scenes.defaultTitle'),
        ...(selectedSecondaryLangs[0] ? { [selectedSecondaryLangs[0]]: t('scenes.defaultTitleEN') } : {})
      },
      settings: { ...DEFAULT_SCENE_SETTINGS }
    }];
  });

  const [activeSceneId, setActiveSceneId] = useState(1);
  const [previewLanguage, setPreviewLanguage] = useState(() => globalSettings.primaryLang);
  const [selectedSceneIds, setSelectedSceneIds] = useState(new Set()); // 多选状态
  const [selectedElement, setSelectedElement] = useState('text');
  const [dragPreview, setDragPreview] = useState(null);
  const [alignmentGuides, setAlignmentGuides] = useState({ vertical: false, horizontal: false });
  const [importProgress, setImportProgress] = useState(INITIAL_IMPORT_PROGRESS); // 导入/翻译进度
  const [, forceImageBoundsRefresh] = useState(0);
  const canvasRef = useRef(null);
  const dragPreviewRef = useRef(null);
  const pointerDragRef = useRef(null);
  const suppressCanvasClickUntilRef = useRef(0);
  const imageCacheRef = useRef(new Map());
  const textMeasureCanvasRef = useRef(null);
  const importProgressHideTimerRef = useRef(null);
  const importProgressJobIdRef = useRef(0);
  const translationQueueRef = useRef(Promise.resolve());
  const progressAbortControllerRef = useRef(null);
  const previousMockupEnabledRef = useRef(mockupEnabled);
  // 确保 activeScene 始终有效，并有默认 settings
  const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0] || {
    id: 1,
    name: getDefaultSceneName(1),
    screenshot: null,
    titleCN: '',
    titleEN: '',
    titles: createSceneTitles(''),
    settings: { ...DEFAULT_SCENE_SETTINGS }
  };

  // 保存当前设备配置到场景
  const saveDeviceConfig = useCallback(() => {
    const config = {
      scale: deviceScale,
      x: deviceX,
      y: deviceY,
      frameColor: deviceFrameColor,
      showUI: showLockScreenUI,
      showShadow: showMockupShadow,
      shadowOpacity: shadowOpacity
    };

    setScenes(prev => prev.map(s =>
      s.id === activeSceneId ? {
        ...s,
        settings: {
          ...s.settings,
          deviceConfigs: {
            ...(s.settings?.deviceConfigs || {}),
            [selectedDevice]: config
          }
        }
      } : s
    ));

    console.log(`[DeviceConfig] Saved ${selectedDevice} config for scene ${activeSceneId}`, config);
  }, [deviceScale, deviceX, deviceY, deviceFrameColor, showLockScreenUI, showMockupShadow, shadowOpacity, activeSceneId, selectedDevice]);

  // State for Selection Mode
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const clearImportProgressHideTimer = () => {
    if (importProgressHideTimerRef.current) {
      clearTimeout(importProgressHideTimerRef.current);
      importProgressHideTimerRef.current = null;
    }
  };

  const isImportProgressJobActive = (jobId) => !jobId || jobId === importProgressJobIdRef.current;

  const startImportProgressJob = () => {
    clearImportProgressHideTimer();
    importProgressJobIdRef.current += 1;
    const jobId = importProgressJobIdRef.current;
    setImportProgress({ ...INITIAL_IMPORT_PROGRESS, active: true });
    return jobId;
  };

  const updateImportProgressState = (jobId, updates) => {
    if (jobId !== importProgressJobIdRef.current) return;
    clearImportProgressHideTimer();
    setImportProgress(prev => ({
      ...prev,
      active: true,
      ...updates
    }));
  };

  const finishImportProgressState = (jobId, updates, autoHideMs = 3000) => {
    if (jobId !== importProgressJobIdRef.current) return;
    clearImportProgressHideTimer();
    setImportProgress(prev => ({
      ...prev,
      active: true,
      ...updates
    }));

    if (autoHideMs > 0) {
      importProgressHideTimerRef.current = setTimeout(() => {
        if (jobId === importProgressJobIdRef.current) {
          setImportProgress(INITIAL_IMPORT_PROGRESS);
        }
      }, autoHideMs);
    }
  };

  useEffect(() => {
    const nextHost = globalSettings.ollamaHost || 'http://localhost:11434';
    const nextAutoTranslate = globalSettings.autoTranslate ?? true;

    setOllamaConfig(prev => {
      if (prev.host === nextHost && prev.autoTranslate === nextAutoTranslate) {
        return prev;
      }
      return {
        ...prev,
        host: nextHost,
        autoTranslate: nextAutoTranslate
      };
    });
  }, [globalSettings.ollamaHost, globalSettings.autoTranslate]);

  useEffect(() => {
    const nextHost = ollamaConfig.host || 'http://localhost:11434';
    const nextAutoTranslate = ollamaConfig.autoTranslate ?? true;

    setGlobalSettings(prev => {
      if (prev.ollamaHost === nextHost && prev.autoTranslate === nextAutoTranslate) {
        return prev;
      }
      return {
        ...prev,
        ollamaHost: nextHost,
        autoTranslate: nextAutoTranslate
      };
    });
  }, [ollamaConfig.host, ollamaConfig.autoTranslate]);

  useEffect(() => {
    const normalizedSecondaryLangs = normalizeSecondaryLangs(
      globalSettings.primaryLang,
      globalSettings.secondaryLangs,
      globalSettings.secondaryLang
    );
    const legacySecondaryLang = normalizedSecondaryLangs[0] || 'none';

    const sameLength = normalizedSecondaryLangs.length === (globalSettings.secondaryLangs || []).length;
    const sameValues = sameLength && normalizedSecondaryLangs.every((lang, index) => lang === globalSettings.secondaryLangs[index]);

    if (!sameValues || globalSettings.secondaryLang !== legacySecondaryLang) {
      setGlobalSettings(prev => ({
        ...prev,
        secondaryLangs: normalizedSecondaryLangs,
        secondaryLang: legacySecondaryLang
      }));
    }
  }, [globalSettings.primaryLang, globalSettings.secondaryLangs, globalSettings.secondaryLang]);

  useEffect(() => {
    if (!allConfiguredLanguageCodes.includes(previewLanguage)) {
      setPreviewLanguage(selectedSecondaryLangs[0] || globalSettings.primaryLang);
    }
  }, [globalSettings.primaryLang, previewLanguage, selectedSecondaryLangs, selectedSecondaryLangsKey]);

  useEffect(() => () => {
    clearImportProgressHideTimer();
    const controller = progressAbortControllerRef.current;
    progressAbortControllerRef.current = null;
    if (controller) {
      controller.abort();
    }
  }, []);

  const handleCloseImportProgress = () => {
    if (!importProgress.active) return;

    clearImportProgressHideTimer();
    importProgressJobIdRef.current += 1;

    const controller = progressAbortControllerRef.current;
    progressAbortControllerRef.current = null;
    if (controller) {
      controller.abort();
    }

    setIsRetranslating(false);
    setImportProgress(INITIAL_IMPORT_PROGRESS);
  };

  // 切换设备或场景时加载已保存的配置
  useEffect(() => {
    if (!mockupEnabled) return;

    const savedConfig = activeScene?.settings?.deviceConfigs?.[selectedDevice];
    if (savedConfig) {
      console.log(`[DeviceConfig] Loading saved config for ${selectedDevice}`, savedConfig);
      setDeviceScale(savedConfig.scale ?? 1.0);
      setDeviceX(savedConfig.x ?? 0);
      setDeviceY(savedConfig.y ?? 400);
      setDeviceFrameColor(savedConfig.frameColor ?? DEVICE_CONFIGS[selectedDevice]?.defaultFrameColor ?? '#C2BCB2');
      setShowLockScreenUI(savedConfig.showUI ?? false);
      setShowMockupShadow(savedConfig.showShadow ?? true);
      setShadowOpacity(savedConfig.shadowOpacity ?? 0.5);
    }
  }, [selectedDevice, activeSceneId, mockupEnabled]); // 只在设备或场景切换时加载

  // 自动保存设备配置 - 当配置变化时自动保存
  useEffect(() => {
    if (!mockupEnabled) return;

    // 使用防抖延迟保存，避免频繁保存
    const timeoutId = setTimeout(() => {
      saveDeviceConfig();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [mockupEnabled, deviceScale, deviceX, deviceY, deviceFrameColor, showLockScreenUI, showMockupShadow, shadowOpacity, saveDeviceConfig]);

  // Persist scenes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('appstore_builder_scenes', JSON.stringify(scenes));
    } catch (e) {
      console.warn('Failed to save scenes to localStorage', e);
    }
  }, [scenes]);

  // --- OLLAMA INTEGRATION ---

  const activeOllamaModel = ollamaConfig.model || ollamaConfig.availableModels[0] || '';
  const canTranslateWithAi = ollamaConfig.isConnected && Boolean(activeOllamaModel) && selectedSecondaryLangs.length > 0;

  const checkOllamaConnection = async ({ jobId } = {}) => {
    const controller = new AbortController();
    const trackProgressAbort = Boolean(jobId) && isImportProgressJobActive(jobId);
    let didTimeout = false;

    if (trackProgressAbort) {
      progressAbortControllerRef.current = controller;
    }

    const timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, OLLAMA_CONNECT_TIMEOUT_MS);

    try {
      const response = await fetch(`${ollamaConfig.host}/api/tags`, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Failed to connect: ${response.status}`);
      }

      const data = await response.json();
      const models = (data.models || []).map(m => m.name).filter(Boolean);
      const hasModels = models.length > 0;

      setOllamaConfig(prev => ({
        ...prev,
        isConnected: true,
        availableModels: models,
        model: models.includes(prev.model) ? prev.model : (models[0] || '')
      }));

      return {
        ok: hasModels,
        reason: hasModels ? null : 'no-models',
        models
      };
    } catch (error) {
      const wasCancelled = error?.name === 'AbortError' && !didTimeout;
      if (!wasCancelled) {
        console.error("Ollama connection failed:", error);
        setOllamaConfig(prev => ({
          ...prev,
          isConnected: false,
          availableModels: [],
          model: ''
        }));
      }

      return {
        ok: false,
        reason: error?.name === 'AbortError'
          ? (didTimeout ? 'timeout' : 'cancelled')
          : 'offline'
      };
    } finally {
      clearTimeout(timeoutId);
      if (trackProgressAbort && progressAbortControllerRef.current === controller) {
        progressAbortControllerRef.current = null;
      }
    }
  };

  useEffect(() => {
    checkOllamaConnection();
  }, []);

  const requestTranslation = async (text, targetLangCode = 'en', { jobId } = {}) => {
    const sourceText = (text || '').trim();
    if (!sourceText) return { ok: false, reason: 'empty', text: '' };
    if (targetLangCode === 'none') return { ok: false, reason: 'disabled', text: sourceText };
    if (!ollamaConfig.isConnected || !activeOllamaModel) return { ok: false, reason: 'not-ready', text: '' };

    const controller = new AbortController();
    const trackProgressAbort = Boolean(jobId) && isImportProgressJobActive(jobId);
    let didTimeout = false;

    if (trackProgressAbort) {
      progressAbortControllerRef.current = controller;
    }

    const timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, TRANSLATION_TIMEOUT_MS);

    try {
      // Find language name
      const targetLang = LANGUAGES.find(l => l.code === targetLangCode);
      const targetLangName = targetLang ? targetLang.name : 'English';

      const prompt = `Translate the following mobile app feature title into ${targetLangName}. Keep it concise, marketing style. Only output the ${targetLangName} text, no explanations. Text: "${sourceText}"`;

      const response = await fetch(`${ollamaConfig.host}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: activeOllamaModel,
          prompt: prompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Translation request failed: ${response.status}`);
      }

      const data = await response.json();
      const translatedText = (data.response || '').trim().replace(/^"|"$/g, '');

      if (!translatedText) {
        return { ok: false, reason: 'empty-response', text: '' };
      }

      return { ok: true, reason: null, text: translatedText };
    } catch (e) {
      const wasCancelled = e?.name === 'AbortError' && !didTimeout;
      if (!wasCancelled) {
        console.error("Translation error:", e);
      }
      return {
        ok: false,
        reason: e?.name === 'AbortError'
          ? (didTimeout ? 'timeout' : 'cancelled')
          : 'error',
        text: ''
      };
    } finally {
      clearTimeout(timeoutId);
      if (trackProgressAbort && progressAbortControllerRef.current === controller) {
        progressAbortControllerRef.current = null;
      }
    }
  };

  // --- CANVAS LOGIC ---

  const loadImage = useCallback((src) => {
    if (!src) {
      return Promise.reject(new Error('Missing image source'));
    }

    const cachedEntry = imageCacheRef.current.get(src);
    if (cachedEntry) {
      return typeof cachedEntry.then === 'function'
        ? cachedEntry
        : Promise.resolve(cachedEntry);
    }

    const imagePromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        imageCacheRef.current.set(src, img);
        resolve(img);
      };
      img.onerror = (error) => {
        imageCacheRef.current.delete(src);
        reject(error);
      };
      img.src = src;
    });

    imageCacheRef.current.set(src, imagePromise);
    return imagePromise;
  }, []);

  const getCachedImageDimensions = (src) => {
    const cachedImage = imageCacheRef.current.get(src);
    if (!cachedImage || typeof cachedImage.then === 'function') {
      return null;
    }

    return {
      width: cachedImage.naturalWidth || cachedImage.width,
      height: cachedImage.naturalHeight || cachedImage.height
    };
  };

  // 用于跟踪渲染版本，避免异步渲染竞态条件导致拖影
  const renderVersionRef = useRef(0);

  const drawCanvas = useCallback(async (canvas, scene, language, isExport = false, overrideOptions = {}) => {
    if (!canvas || !scene) return;

    // 增加渲染版本号 (only track if not exporting with overrides, to avoid race conditions in UI but allow export to proceed)
    const currentVersion = ++renderVersionRef.current;

    const ctx = canvas.getContext('2d');
    const { width, height, backgroundType, backgroundValue, backgroundUpload } = globalSettings;
    const sceneSettings = { ...DEFAULT_SCENE_SETTINGS, ...(scene.settings || {}) };

    canvas.width = width;
    canvas.height = height;

    // Clear canvas to prevent ghost images when scaling
    ctx.clearRect(0, 0, width, height);

    // 重置所有 canvas 状态
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Resolve variables from overrides or state
    // If overrideOptions has a property, use it. Otherwise use the state value.
    const effectiveMockupEnabled = overrideOptions.mockupEnabled !== undefined ? overrideOptions.mockupEnabled : mockupEnabled;
    const effectiveSelectedDevice = overrideOptions.selectedDevice !== undefined ? overrideOptions.selectedDevice : selectedDevice;
    const effectiveDeviceLayers = overrideOptions.deviceLayers !== undefined ? overrideOptions.deviceLayers : deviceLayers;
    const effectiveDeviceScale = overrideOptions.deviceScale !== undefined ? overrideOptions.deviceScale : deviceScale;
    const effectiveDeviceX = overrideOptions.deviceX !== undefined ? overrideOptions.deviceX : deviceX;
    const effectiveDeviceY = overrideOptions.deviceY !== undefined ? overrideOptions.deviceY : deviceY;
    const effectiveFrameColor = overrideOptions.deviceFrameColor !== undefined ? overrideOptions.deviceFrameColor : deviceFrameColor;
    const effectiveShowUI = overrideOptions.showLockScreenUI !== undefined ? overrideOptions.showLockScreenUI : showLockScreenUI;
    const effectiveShowShadow = overrideOptions.showMockupShadow !== undefined ? overrideOptions.showMockupShadow : showMockupShadow;
    const effectiveShadowOpacity = overrideOptions.shadowOpacity !== undefined ? overrideOptions.shadowOpacity : shadowOpacity;

    // 检查渲染版本是否仍然有效的辅助函数 (skip check for exports)
    const isRenderValid = () => isExport ? true : renderVersionRef.current === currentVersion;

    // 1. Draw Background
    if ((backgroundType === 'upload' || backgroundType === 'builtin') && backgroundUpload) {
      try {
        const bgImg = await loadImage(backgroundUpload);
        // Calculate 'cover' fit first
        const ratio = Math.max(width / bgImg.width, height / bgImg.height);

        // Apply user scale on top of cover fit
        const scale = ratio * (globalSettings.backgroundScale || 1.0);

        // Calculate dimensions
        const bgWidth = bgImg.width * scale;
        const bgHeight = bgImg.height * scale;

        // Center + user offset
        const x = (width - bgWidth) / 2 + (globalSettings.backgroundX || 0);
        const y = (height - bgHeight) / 2 + (globalSettings.backgroundY || 0);

        ctx.drawImage(bgImg, 0, 0, bgImg.width, bgImg.height, x, y, bgWidth, bgHeight);
      } catch (e) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, width, height);
      }
    } else if (backgroundType === 'custom-gradient') {
      // 3. Custom Gradient
      const { color1, color2, angle, stop1 = 0, stop2 = 100 } = globalSettings.customGradient || { color1: '#FFFFFF', color2: '#9CA3AF', angle: 180, stop1: 0, stop2: 100 };

      // Calculate gradient coordinates based on angle
      // CSS angle: 0deg = up, 90deg = right, 180deg = down
      const angleRad = (angle - 90) * (Math.PI / 180); // Convert to Canvas coordinate system (0 is right)

      // Calculate diagonal length to ensure full coverage
      const diagonal = Math.sqrt(width * width + height * height);

      // Calculate start and end points relative to center
      const centerX = width / 2;
      const centerY = height / 2;

      // Start point (opposite to direction)
      const x1 = centerX - Math.cos(angleRad) * diagonal / 2;
      const y1 = centerY - Math.sin(angleRad) * diagonal / 2;

      // End point (direction)
      const x2 = centerX + Math.cos(angleRad) * diagonal / 2;
      const y2 = centerY + Math.sin(angleRad) * diagonal / 2;

      const g = ctx.createLinearGradient(x1, y1, x2, y2);
      g.addColorStop(stop1 / 100, color1);
      g.addColorStop(stop2 / 100, color2);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

    } else {
      // Parse gradient from CSS linear-gradient string (Legacy Presets)
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

    // 2. Draw Text (Helper Function) - 支持多语言系统
    const renderTextLayer = () => {
      const resolvedLanguageCode = resolveCanvasLanguageCode(language);
      const isPrimaryLang = resolvedLanguageCode === globalSettings.primaryLang;
      const sceneLanguageStyle = getSceneLanguageStyle(scene, resolvedLanguageCode);
      const globalLanguageStyle = getGlobalLanguageStyle(resolvedLanguageCode);
      let text = getSceneTitleByLanguage(scene, resolvedLanguageCode);

      // 如果是翻译语言且开启大写，应用大写转换
      if (!isPrimaryLang && globalLanguageStyle.uppercase && text) {
        text = text.toUpperCase();
      }

      if (text) {
        const fontSize = sceneLanguageStyle.textSize;
        const textOffsetX = sceneLanguageStyle.textX || 0;
        const textY = sceneLanguageStyle.textY;
        const fontFamily = globalLanguageStyle.font;
        ctx.font = `bold ${fontSize}px ${fontFamily}`;

        // Get text alignment
        const textAlign = globalSettings.textAlign || 'center';
        ctx.textAlign = textAlign;
        ctx.textBaseline = 'top';

        // Calculate X position based on alignment + scene offset
        const textX = getTextAnchorX(width, textAlign, textOffsetX);

        // Get color settings
        const colorId = globalLanguageStyle.textColor;
        const colorPreset = TEXT_COLORS.find(c => c.id === colorId) || TEXT_COLORS[0];

        // Apply text shadow if enabled
        if (globalSettings.textShadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = fontSize * 0.15;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = fontSize * 0.05;
        }

        // Apply color with bottom fade effect - use fadeStart and fadeOpacity
        const rawFadeStart = globalSettings.fadeStart !== undefined ? globalSettings.fadeStart : 0.7;
        // Clamp fadeStart to 0-1 for addColorStop, but keep raw value for logic if needed
        const fadeStart = Math.max(0, Math.min(1, rawFadeStart));
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
          const sWidthMultiplier = globalSettings.strokeWidth ? (globalSettings.strokeWidth / 100) : 0.04;
          ctx.lineWidth = fontSize * sWidthMultiplier;
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
            ctx.save();
            ctx.globalAlpha = globalSettings.strokeOpacity !== undefined ? globalSettings.strokeOpacity : 1.0;
            ctx.strokeText(line, textX, lineY);
            ctx.restore();
          }

          ctx.fillText(line, textX, lineY);
        });

        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    };

    // Render Text (Bottom Layer - Default)
    if (!globalSettings.textOnTop) {
      renderTextLayer();
    }

    // 3. Draw Screenshot (Top Layer) - with optional Device Mockup
    if (scene.screenshot) {
      try {
        const ssImg = await loadImage(scene.screenshot);

        // 检查渲染版本是否仍然有效
        if (!isRenderValid()) return;

        const baseScale = sceneSettings.screenshotScale ?? DEFAULT_SCENE_SETTINGS.screenshotScale;

        // Check if device mockup is enabled use effective value
        if (effectiveMockupEnabled && DEVICE_CONFIGS[effectiveSelectedDevice]) {
          const deviceConfig = DEVICE_CONFIGS[effectiveSelectedDevice];

          // ====== Apple Family Composite Mode ======
          if (deviceConfig.isComposite && deviceConfig.devices && deviceConfig.layout) {
            // 复合模式：渲染多个设备
            const compositeDevices = deviceConfig.devices
              .map(deviceId => ({
                id: deviceId,
                config: DEVICE_CONFIGS[deviceId],
                layoutConfig: deviceConfig.layout[deviceId],
              }))
              .filter(d => d.config && d.layoutConfig)
              .sort((a, b) => a.layoutConfig.zIndex - b.layoutConfig.zIndex); // 按 zIndex 排序

            // 整体缩放和位移（使用设备面板的控制值）
            const groupScale = effectiveDeviceScale || 1.0;
            const groupOffsetX = effectiveDeviceX || 0;
            const groupOffsetY = effectiveDeviceY || 0;

            // Define reference dimensions (standard Mac canvas)
            // Use these to lock the relative positions and sizes
            const REF_WIDTH = 2880;
            const REF_HEIGHT = 1800;

            // Calculate a uniform base scale factor based on width ratio
            // This ensures the group scales uniformly to fit the canvas width, maintaining aspect ratio
            const baseRatio = width / REF_WIDTH;

            // 为每个设备渲染
            for (const { id: deviceId, config: dConfig, layoutConfig } of compositeDevices) {
              try {
                // 获取设备配置（保持原始方向，不做旋转）
                const screen = { ...dConfig.screen };
                const frameSize = { ...dConfig.frameSize };
                const cornerRadius = dConfig.cornerRadius;

                // 计算由布局定义的参考尺寸和位置 (Pixel values in the Reference Canvas)
                const refDeviceWidth = REF_WIDTH * layoutConfig.scale;

                // 计算当前画布上的实际尺寸 (Uniformly scaled)
                const deviceBaseWidth = refDeviceWidth * baseRatio * groupScale;
                const deviceScaleRatio = deviceBaseWidth / frameSize.width;

                const scaledFrameWidth = frameSize.width * deviceScaleRatio;
                const scaledFrameHeight = frameSize.height * deviceScaleRatio;
                const scaledScreenWidth = screen.width * deviceScaleRatio;
                const scaledScreenHeight = screen.height * deviceScaleRatio;
                const scaledScreenX = screen.x * deviceScaleRatio;
                const scaledScreenY = screen.y * deviceScaleRatio;
                const scaledCornerRadius = cornerRadius * deviceScaleRatio;

                // 计算绘制位置
                // 1. Calculate center in Reference Canvas
                const refCenterX = REF_WIDTH * layoutConfig.x;
                const refCenterY = REF_HEIGHT * layoutConfig.y;

                // 2. Calculate offset from Reference Center
                const refCanvasCenterX = REF_WIDTH * 0.5;
                const refCanvasCenterY = REF_HEIGHT * 0.5;
                const refOffsetX = refCenterX - refCanvasCenterX;
                const refOffsetY = refCenterY - refCanvasCenterY;

                // 3. Apply uniform scale to offsets and map to Current Canvas Center
                // This preserves the relative visual distance between devices
                const canvasCenterX = width * 0.5;
                const canvasCenterY = height * 0.5;

                const finalCenterX = canvasCenterX + (refOffsetX * baseRatio * groupScale) + groupOffsetX;
                const finalCenterY = canvasCenterY + (refOffsetY * baseRatio * groupScale) + groupOffsetY;

                const frameX = finalCenterX - scaledFrameWidth / 2;
                const frameY = finalCenterY - scaledFrameHeight / 2;

                // 加载设备 SVG 图层（复合模式下不显示投影）
                if (dConfig.useSvgLayers && dConfig.svgPath) {
                  try {
                    const layers = await loadDeviceSvgLayers(dConfig.svgPath, {
                      frameColor: effectiveFrameColor,
                      showUI: effectiveShowUI,
                      showShadow: false, // 复合模式下关闭投影
                      deviceConfig: dConfig,
                    });

                    if (!isRenderValid()) return;

                    // 复合模式下不绘制投影（跳过）

                    // 创建屏幕裁剪区域并绘制截图
                    ctx.save();
                    ctx.beginPath();
                    ctx.roundRect(
                      frameX + scaledScreenX,
                      frameY + scaledScreenY,
                      scaledScreenWidth,
                      scaledScreenHeight,
                      scaledCornerRadius
                    );
                    ctx.clip();

                    // Fill screen background with gray to prevent transparency
                    ctx.fillStyle = '#E5E5E5';
                    ctx.fill();

                    // 绘制截图
                    // Get screenshot scale from scene settings (default 1.0 for device mode)
                    const ssScale = sceneSettings.screenshotScale ?? 1.0;

                    const ssAspect = ssImg.width / ssImg.height;
                    const screenAspect = scaledScreenWidth / scaledScreenHeight;
                    let baseDrawWidth, baseDrawHeight;

                    if (ssAspect > screenAspect) {
                      // Screenshot is wider - fit height
                      baseDrawHeight = scaledScreenHeight;
                      baseDrawWidth = baseDrawHeight * ssAspect;
                    } else {
                      // Screenshot is taller - fit width
                      baseDrawWidth = scaledScreenWidth;
                      baseDrawHeight = baseDrawWidth / ssAspect;
                    }

                    // Apply screenshot scale from scene settings
                    const drawWidth = baseDrawWidth * ssScale;
                    const drawHeight = baseDrawHeight * ssScale;

                    // Calculate position with offset from scene settings
                    const ssOffsetX = sceneSettings.screenshotX || 0;
                    const ssOffsetY = sceneSettings.screenshotY || 0;
                    const drawX = frameX + scaledScreenX + (scaledScreenWidth - drawWidth) / 2 + ssOffsetX * deviceScaleRatio;
                    const drawY = frameY + scaledScreenY + (scaledScreenHeight - drawHeight) / 2 + ssOffsetY * deviceScaleRatio;

                    ctx.drawImage(ssImg, drawX, drawY, drawWidth, drawHeight);

                    // 绘制 UI 层
                    if (effectiveShowUI && layers.ui) {
                      ctx.drawImage(layers.ui, frameX, frameY, scaledFrameWidth, scaledFrameHeight);
                    }

                    ctx.restore();

                    // 绘制设备边框
                    if (layers.frame) {
                      ctx.drawImage(layers.frame, frameX, frameY, scaledFrameWidth, scaledFrameHeight);
                    }
                  } catch (e) {
                    console.warn(`Failed to render composite device ${deviceId}:`, e);
                  }
                }
              } catch (e) {
                console.warn(`Error rendering device ${deviceId}:`, e);
              }
            }
          } else {
            // ====== Single Device Mode (Original Logic) ======
            let { screen, frameSize, cornerRadius } = deviceConfig;

            // Handle iPad orientation switch
            let actualIsLandscape = deviceConfig.isLandscape;
            if (effectiveSelectedDevice === 'ipad-pro') {
              actualIsLandscape = iPadLandscape; // This probably should also come from override if needed, but for now state is ok or add to overrides
              // Swap dimensions if orientation is different from default
              if (!iPadLandscape) {
                // Switch to portrait - swap screen and frame dimensions
                screen = {
                  x: deviceConfig.screen.y,
                  y: deviceConfig.screen.x,
                  width: deviceConfig.screen.height,
                  height: deviceConfig.screen.width,
                };
                frameSize = {
                  width: deviceConfig.frameSize.height,
                  height: deviceConfig.frameSize.width,
                };
              }
            }

            // Use deviceScale for independent device sizing
            const finalDeviceScale = effectiveDeviceScale;

            // Calculate base scale to fit device reasonably
            const baseDeviceWidth = width * 0.35;
            const baseDeviceHeight = height * 0.6;

            const deviceWidth = frameSize.width;
            const deviceHeight = frameSize.height;

            const baseScaleRatio = Math.min(
              baseDeviceWidth / deviceWidth,
              baseDeviceHeight / deviceHeight
            );

            // Apply user's device scale
            const scaleRatio = baseScaleRatio * finalDeviceScale;

            const scaledFrameWidth = deviceWidth * scaleRatio;
            const scaledFrameHeight = deviceHeight * scaleRatio;
            const scaledScreenWidth = screen.width * scaleRatio;
            const scaledScreenHeight = screen.height * scaleRatio;
            const scaledScreenX = screen.x * scaleRatio;
            const scaledScreenY = screen.y * scaleRatio;
            const scaledCornerRadius = cornerRadius * scaleRatio;

            // Use deviceX and deviceY for device position (independent of screenshot position)
            const frameX = (width - scaledFrameWidth) / 2 + effectiveDeviceX;
            const frameY = effectiveDeviceY;

            // Shadow for device frame
            // Shadow for device frame - REMOVED: Managed by DeviceMockup settings (showMockupShadow)
            // if (scene.settings.screenshotShadow !== false) { ... }

            // Draw device frame background (for shadow) - skip for SVG layers and PNG frames
            // These modes will have shadow applied directly when drawing the image
            if (!deviceConfig.useSvgLayers && !deviceConfig.usePngFrame) {
              ctx.fillStyle = effectiveFrameColor;
              const outerRadius = scaledCornerRadius + 8 * scaleRatio;
              ctx.beginPath();
              ctx.roundRect(frameX, frameY, scaledFrameWidth, scaledFrameHeight, outerRadius);
              ctx.fill();
            }

            // Reset shadow before drawing content
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;


            // 预加载 SVG 图层（从外部状态获取缓存的图层）
            // 如果图层尚未加载完成，暂时不绘制（或者等待下一帧）
            const svgLayers = effectiveDeviceLayers;

            if (deviceConfig.useSvgLayers && deviceConfig.svgPath && svgLayers) {
              try {
                // 检查渲染版本是否仍然有效
                if (!isRenderValid()) return;

                // 在裁剪区之前绘制投影层（投影应该在设备外围）
                if (effectiveShowShadow && svgLayers.shadow) {
                  // 使用 shadowTransform 配置计算投影的绘制位置和尺寸
                  const st = deviceConfig.shadowTransform;
                  if (st) {
                    // 计算投影在 SVG 坐标系中的实际尺寸和位置
                    const shadowScale = st.scale || 1;
                    const shadowWidthInSvg = st.width * shadowScale;
                    const shadowHeightInSvg = st.height * shadowScale;
                    const shadowXInSvg = st.x;
                    const shadowYInSvg = st.y;

                    // 计算画布上的投影尺寸（按设备缩放比例）
                    const shadowDrawWidth = shadowWidthInSvg * scaleRatio;
                    const shadowDrawHeight = shadowHeightInSvg * scaleRatio;
                    const shadowDrawX = frameX + (shadowXInSvg * scaleRatio);
                    const shadowDrawY = frameY + (shadowYInSvg * scaleRatio);

                    ctx.save();
                    ctx.globalAlpha = effectiveShadowOpacity;
                    ctx.drawImage(svgLayers.shadow, shadowDrawX, shadowDrawY, shadowDrawWidth, shadowDrawHeight);
                    ctx.restore();
                  } else {
                    // 没有 shadowTransform 配置时使用设备框架尺寸
                    ctx.save();
                    ctx.globalAlpha = effectiveShadowOpacity;
                    ctx.drawImage(svgLayers.shadow, frameX, frameY, scaledFrameWidth, scaledFrameHeight);
                    ctx.restore();
                  }
                }
              } catch (e) {
                console.warn('Failed to load SVG layers:', e);
              }
            }

            // Create clipping path for screen area
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(
              frameX + scaledScreenX,
              frameY + scaledScreenY,
              scaledScreenWidth,
              scaledScreenHeight,
              scaledCornerRadius
            );
            ctx.clip();

            // Fill screen background with gray to prevent transparency
            ctx.fillStyle = '#E5E5E5';
            ctx.fill();

            // Draw screenshot within clipped area using scene settings
            const ssAspect = ssImg.width / ssImg.height;
            const screenAspect = scaledScreenWidth / scaledScreenHeight;

            // Get screenshot scale from scene settings (default 1.0 for device mode)
            const ssScale = sceneSettings.screenshotScale ?? 1.0;

            // Base size calculation (cover fit)
            let baseDrawWidth, baseDrawHeight;
            if (ssAspect > screenAspect) {
              // Screenshot is wider - fit height
              baseDrawHeight = scaledScreenHeight;
              baseDrawWidth = baseDrawHeight * ssAspect;
            } else {
              // Screenshot is taller - fit width
              baseDrawWidth = scaledScreenWidth;
              baseDrawHeight = baseDrawWidth / ssAspect;
            }

            // Apply screenshot scale from scene settings
            const drawWidth = baseDrawWidth * ssScale;
            const drawHeight = baseDrawHeight * ssScale;

            // Calculate position with offset from scene settings
            const ssOffsetX = sceneSettings.screenshotX || 0;
            const ssOffsetY = sceneSettings.screenshotY || 0;
            const drawX = frameX + scaledScreenX + (scaledScreenWidth - drawWidth) / 2 + ssOffsetX * scaleRatio;
            const drawY = frameY + scaledScreenY + (scaledScreenHeight - drawHeight) / 2 + ssOffsetY * scaleRatio;

            ctx.drawImage(ssImg, drawX, drawY, drawWidth, drawHeight);

            // Draw Lock Screen UI overlay if enabled
            if (effectiveShowUI && deviceConfig.hasLockScreen) {
              try {
                // Check if using SVG layers or legacy modes
                if (deviceConfig.useSvgLayers && deviceConfig.svgPath) {
                  // New SVG layers mode - UI layer is handled separately below
                  // Skip here as we'll draw it with the frame
                } else if (deviceConfig.usePngFrame && deviceConfig.uiSvg) {
                  // Legacy PNG + SVG mode
                  const uiImg = await loadImage(deviceConfig.uiSvg);
                  ctx.drawImage(
                    uiImg,
                    frameX,
                    frameY,
                    scaledFrameWidth,
                    scaledFrameHeight
                  );
                } else {
                  // Use generated lock screen SVG
                  const lockScreenSVG = generateLockScreenUI(effectiveSelectedDevice);
                  if (lockScreenSVG) {
                    const lockScreenImg = await svgToImage(lockScreenSVG);
                    ctx.drawImage(
                      lockScreenImg,
                      frameX + scaledScreenX,
                      frameY + scaledScreenY,
                      scaledScreenWidth,
                      scaledScreenHeight
                    );
                  }
                }
              } catch (e) {
                console.warn('Failed to render lock screen UI:', e);
              }
            }

            ctx.restore();

            // Draw device frame on top
            try {
              // Check if using new SVG layers mode
              if (deviceConfig.useSvgLayers && deviceConfig.svgPath && svgLayers) {
                // 使用预加载的 SVG 图层

                // Draw UI layer (if enabled and available)
                if (effectiveShowUI && svgLayers.ui) {
                  ctx.drawImage(svgLayers.ui, frameX, frameY, scaledFrameWidth, scaledFrameHeight);
                }

                // Apply shadow effect to frame
                // Apply shadow effect to frame - REMOVED: Managed by DeviceMockup settings (showMockupShadow)
                // if (scene.settings.screenshotShadow !== false) { ... }

                // Draw frame on top
                if (svgLayers.frame) {
                  ctx.drawImage(svgLayers.frame, frameX, frameY, scaledFrameWidth, scaledFrameHeight);
                }

                // Reset shadow
                ctx.shadowColor = "transparent";
                ctx.shadowBlur = 0;
                ctx.shadowOffsetY = 0;
              } else if (deviceConfig.usePngFrame && deviceConfig.framePng) {
                // Legacy PNG frame mode
                const frameImg = await loadImage(deviceConfig.framePng);
                // Apply shadow directly to PNG frame
                // Apply shadow directly to PNG frame - REMOVED: Managed by DeviceMockup settings (showMockupShadow)
                // if (scene.settings.screenshotShadow !== false) { ... }
                ctx.drawImage(frameImg, frameX, frameY, scaledFrameWidth, scaledFrameHeight);
                // Reset shadow
                ctx.shadowColor = "transparent";
                ctx.shadowBlur = 0;
                ctx.shadowOffsetY = 0;
              } else {
                // Use generated device frame SVG
                // For iPad portrait mode, we need to generate rotated SVG
                const effectiveDevice = effectiveSelectedDevice === 'ipad-pro' && !iPadLandscape
                  ? 'ipad-pro-portrait'
                  : effectiveSelectedDevice;
                const frameSVG = generateDeviceFrameSVG(effectiveSelectedDevice, effectiveFrameColor, !iPadLandscape && effectiveSelectedDevice === 'ipad-pro');
                if (frameSVG) {
                  const frameImg = await svgToImage(frameSVG);
                  ctx.drawImage(frameImg, frameX, frameY, scaledFrameWidth, scaledFrameHeight);
                }
              }
            } catch (e) {
              console.warn('Failed to render device frame:', e);
            }

          } // End of single device mode else block
        } else {
          // Original screenshot rendering (without device mockup)
          const targetWidth = width * 0.6 * baseScale;
          const ratio = targetWidth / ssImg.width;
          const targetHeight = ssImg.height * ratio;

          const x = (width - targetWidth) / 2 + (sceneSettings.screenshotX || 0);
          const y = sceneSettings.screenshotY ?? DEFAULT_SCENE_SETTINGS.screenshotY;

          // Shadow - controlled by screenshotShadow setting
          if (sceneSettings.screenshotShadow !== false) {
            ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
            ctx.shadowBlur = 50;
            ctx.shadowOffsetY = 30;
          }

          ctx.drawImage(ssImg, x, y, targetWidth, targetHeight);

          // Reset shadow
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetY = 0;
        }
      } catch (e) {
        console.error("Error loading screenshot", e);
      }
    }

    // 4. Render Text (Top Layer - Optional)
    if (globalSettings.textOnTop) {
      renderTextLayer();
    }

  }, [globalSettings, mockupEnabled, selectedDevice, deviceFrameColor, showLockScreenUI, showMockupShadow, shadowOpacity, deviceLayers, deviceScale, deviceX, deviceY, iPadLandscape, loadImage]);

  // 使用 requestAnimationFrame 防抖，优化拖拽时的渲染性能
  const rafIdRef = useRef(null);

  useEffect(() => {
    if (activeScene && canvasRef.current) {
      // 取消之前的渲染请求
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }

      // 使用 requestAnimationFrame 合并渲染请求
      rafIdRef.current = requestAnimationFrame(() => {
        drawCanvas(canvasRef.current, activeScene, previewLanguage);
      });
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [activeScene, globalSettings, previewLanguage, drawCanvas, mockupEnabled, selectedDevice, deviceFrameColor, showLockScreenUI, showMockupShadow, deviceScale, deviceX, deviceY, iPadLandscape, appMode]);

  useEffect(() => {
    if (!activeScene?.screenshot) {
      return undefined;
    }

    let cancelled = false;
    loadImage(activeScene.screenshot)
      .then(() => {
        if (!cancelled) {
          forceImageBoundsRefresh(version => version + 1);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [activeScene?.screenshot, loadImage]);

  useEffect(() => {
    if (!globalSettings.backgroundUpload || !['upload', 'builtin'].includes(globalSettings.backgroundType)) {
      return undefined;
    }

    let cancelled = false;
    loadImage(globalSettings.backgroundUpload)
      .then(() => {
        if (!cancelled) {
          forceImageBoundsRefresh(version => version + 1);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [globalSettings.backgroundType, globalSettings.backgroundUpload, loadImage]);


  // --- HANDLERS ---

  // 处理截图导入 - 支持 Electron 两步选择或普通文件上传
  const handleBatchUpload = async (e) => {
    let imagesToImport = [];
    const inputEl = e?.target;

    try {
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
    } finally {
      if (inputEl) {
        inputEl.value = '';
      }
    }
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
    const jobId = startImportProgressJob();

    try {
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
            finishImportProgressState(jobId, {
              phase: 'import',
              status: 'warning',
              current: 0,
              total: 0,
              message: t('alerts.noNewScreenshots', '没有新的截图需要导入'),
              detail: t('alerts.noNewScreenshotsDetail', '所选文件都已存在，未创建新场景'),
              successCount: 0,
              failedCount: 0,
              skippedCount: imagesToImport.length
            }, 3000);
            alert(t('alerts.noNewScreenshots'));
            return;
          }
        }
      }

      // 开始导入，显示进度条
      updateImportProgressState(jobId, {
        phase: 'import',
        status: 'running',
        current: 0,
        total: imagesToProcess.length,
        message: t('alerts.importPreparing', '准备导入...'),
        detail: t('alerts.importReadingFiles', '正在读取并创建截图场景')
      });

      // 检查是否是默认空场景
      const isDefaultState = scenes.length === 1 && !scenes[0].screenshot;

      // 处理重名覆盖
      let updatedScenes = isDefaultState ? [] : [...scenes];
      let startId = isDefaultState ? 1 : (Math.max(...scenes.map(s => s.id), 0) + 1);
      const scenesNeedingTranslation = [];

      for (let i = 0; i < imagesToProcess.length; i++) {
        const img = imagesToProcess[i];
        const nameWithoutExt = img.name;

        // 更新进度
        updateImportProgressState(jobId, {
          phase: 'import',
          status: 'running',
          current: i + 1,
          total: imagesToProcess.length,
          message: `正在导入: ${nameWithoutExt}`
        });

        // 检查是否存在同名场景
        const existingIndex = updatedScenes.findIndex(s => s.name === nameWithoutExt);
        const sceneId = existingIndex >= 0 ? updatedScenes[existingIndex].id : startId++;

        const newScene = {
          id: sceneId,
          name: nameWithoutExt,
          screenshot: img.data,
          titleCN: nameWithoutExt,
          titleEN: nameWithoutExt,
          titles: createSceneTitles(nameWithoutExt, existingIndex >= 0 ? updatedScenes[existingIndex] : null),
          settings: existingIndex >= 0 ? updatedScenes[existingIndex].settings : { ...scenes[0]?.settings || DEFAULT_SCENE_SETTINGS }
        };

        if (existingIndex >= 0) {
          // 覆盖已存在的场景
          updatedScenes[existingIndex] = newScene;
        } else {
          updatedScenes.push(newScene);
        }

        scenesNeedingTranslation.push({ id: sceneId, title: nameWithoutExt });
      }

      setScenes(updatedScenes);

      // Switch to first new scene
      if (imagesToProcess.length > 0) {
        const firstImported = updatedScenes.find(s => s.name === imagesToProcess[0].name);
        if (firstImported) {
          setActiveSceneId(firstImported.id);
        }
      }

      if (!ollamaConfig.autoTranslate) {
        finishImportProgressState(jobId, {
          phase: 'import',
          status: 'success',
          current: imagesToProcess.length,
          total: imagesToProcess.length,
          message: t('alerts.importComplete', '导入完成'),
          detail: t('alerts.autoTranslateDisabledDetail', '自动翻译已关闭，您仍可稍后手动翻译'),
          successCount: imagesToProcess.length,
          failedCount: 0,
          skippedCount: 0
        }, 3000);
        return;
      }

      if (selectedSecondaryLangs.length === 0) {
        finishImportProgressState(jobId, {
          phase: 'translate',
          status: 'warning',
          current: imagesToProcess.length,
          total: imagesToProcess.length,
          message: t('alerts.autoTranslateMissingTarget', '未设置翻译语言，已跳过自动翻译'),
          detail: t('alerts.translationSetSecondaryLang', '请先在语言设置中选择翻译语言'),
          successCount: 0,
          failedCount: 0,
          skippedCount: imagesToProcess.length
        }, 4000);
        return;
      }

      updateImportProgressState(jobId, {
        phase: 'translate',
        status: 'queued',
        current: 0,
        total: scenesNeedingTranslation.length * selectedSecondaryLangs.length,
        message: t('alerts.translationQueued', '导入完成，正在准备翻译队列'),
        detail: t('alerts.translationQueuedDetail', '截图已导入，翻译将在后台按顺序执行'),
        successCount: 0,
        failedCount: 0,
        skippedCount: 0
      });

      void enqueueTranslationSequence(
        scenesNeedingTranslation.flatMap(scene => (
          selectedSecondaryLangs.map(targetLangCode => ({
            id: scene.id,
            sourceText: scene.title,
            targetLangCode
          }))
        )),
        { jobId, mode: 'auto' }
      );
    } catch (error) {
      console.error('Import screenshots failed:', error);
      finishImportProgressState(jobId, {
        phase: 'import',
        status: 'error',
        current: 0,
        total: imagesToImport.length,
        message: t('alerts.importFailed', '导入失败'),
        detail: error?.message || t('alerts.importFailedDetail', '请检查图片文件后重试'),
        successCount: 0,
        failedCount: imagesToImport.length,
        skippedCount: 0
      }, 6000);
    }
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

  const clearAllUploadedBackgrounds = () => {
    setConfirmDialog({
      isOpen: true,
      title: t('sidebar.clearAll'),
      message: t('alerts.confirmDeleteBackground') + ' (' + t('sidebar.clearAll') + ')',
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
      type: 'danger',
      onConfirm: () => {
        setUploadedBackgrounds([]);
        if (globalSettings.backgroundType === 'upload') {
          setGlobalSettings(prev => ({
            ...prev,
            backgroundType: 'preset',
            backgroundValue: PRESETS[0].value,
          }));
        }
        setConfirmDialog({ isOpen: false });
      }
    });
  };

  const updateScene = (id, updates) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const processTranslationSequence = async (items, { jobId, mode = 'auto' } = {}) => {
    if (!items.length) return { ok: true, translated: 0, failed: 0, skipped: 0 };
    if (!isImportProgressJobActive(jobId)) {
      return { ok: false, translated: 0, failed: 0, skipped: items.length, cancelled: true };
    }

    const isManualMode = mode === 'manual';
    const isBatchMode = mode === 'batch';

    if (selectedSecondaryLangs.length === 0) {
      finishImportProgressState(jobId, {
        phase: 'translate',
        status: 'warning',
        current: items.length,
        total: items.length,
        message: isManualMode
          ? t('alerts.manualTranslateMissingTarget', '未设置翻译语言，无法执行手动翻译')
          : isBatchMode
            ? t('alerts.batchTranslateMissingTarget', '未设置翻译语言，无法执行批量翻译')
          : t('alerts.autoTranslateMissingTarget', '未设置翻译语言，已跳过自动翻译'),
        detail: t('alerts.translationSetSecondaryLang', '请先在语言设置中选择翻译语言'),
        successCount: 0,
        failedCount: 0,
        skippedCount: items.length
      }, 5000);
      return { ok: false, translated: 0, failed: 0, skipped: items.length };
    }

    const connection = await checkOllamaConnection({ jobId });
    if (!isImportProgressJobActive(jobId) || connection.reason === 'cancelled') {
      return { ok: false, translated: 0, failed: 0, skipped: items.length, cancelled: true };
    }

    if (!connection.ok) {
      setShowOllamaGuide(true);

      const missingOllamaMessage = connection.reason === 'no-models'
        ? t('alerts.ollamaNoModels', '已检测到 Ollama，但没有可用模型，已跳过翻译')
        : t('alerts.ollamaUnavailable', '未检测到可用的 Ollama 服务，已跳过翻译');
      const missingOllamaDetail = connection.reason === 'no-models'
        ? t('alerts.ollamaNoModelsDetail', '请先执行 ollama run qwen2.5:7b 或其他模型')
        : t('alerts.ollamaUnavailableDetail', '请安装并启动 Ollama，然后再试一次翻译');

      finishImportProgressState(jobId, {
        phase: 'translate',
        status: 'warning',
        current: items.length,
        total: items.length,
        message: isManualMode
          ? t('alerts.manualTranslateUnavailable', '手动翻译不可用')
          : isBatchMode
            ? t('alerts.batchTranslateUnavailable', '批量翻译不可用')
          : missingOllamaMessage,
        detail: missingOllamaDetail,
        successCount: 0,
        failedCount: 0,
        skippedCount: items.length
      }, 6000);
      return { ok: false, translated: 0, failed: 0, skipped: items.length };
    }

    let translated = 0;
    let failed = 0;
    let skipped = 0;
    let timeoutCount = 0;

    for (let i = 0; i < items.length; i++) {
      if (!isImportProgressJobActive(jobId)) {
        return { ok: false, translated, failed, skipped, cancelled: true };
      }

      const item = items[i];
      const targetLanguageInfo = getLanguageInfo(item.targetLangCode);

      updateImportProgressState(jobId, {
        phase: 'translate',
        status: 'running',
        current: i + 1,
        total: items.length,
        message: isManualMode
          ? `${t('text.reTranslate')} ${i + 1}/${items.length}`
          : isBatchMode
            ? `${t('ollama.batchTranslateAll', '批量翻译')} ${i + 1}/${items.length}`
          : `${t('alerts.translating', '正在翻译')} ${i + 1}/${items.length}`,
        detail: `${targetLanguageInfo?.nativeName || item.targetLangCode} · ${item.sourceText}`,
        successCount: translated,
        failedCount: failed,
        skippedCount: skipped
      });

      const result = await requestTranslation(item.sourceText, item.targetLangCode, { jobId });
      if (!isImportProgressJobActive(jobId) || result.reason === 'cancelled') {
        return { ok: false, translated, failed, skipped, cancelled: true };
      }

      if (result.ok) {
        setScenes(prev => prev.map(scene => {
          if (scene.id !== item.id) return scene;
          return {
            ...scene,
            ...buildSceneTitleUpdate(scene, item.targetLangCode, result.text)
          };
        }));
        translated += 1;
      } else {
        failed += 1;
        if (result.reason === 'timeout') {
          timeoutCount += 1;
          if (i === 0) {
            const remainingCount = Math.max(0, items.length - 1);
            skipped += remainingCount;

            finishImportProgressState(jobId, {
              phase: 'translate',
              status: 'warning',
              current: items.length,
              total: items.length,
              message: isManualMode
                ? t('alerts.manualTranslateStoppedAfterTimeout', '首张翻译超时，已停止本次重新翻译')
                : isBatchMode
                  ? t('alerts.batchTranslateStoppedAfterTimeout', '首张翻译超时，已停止本次批量翻译')
                : t('alerts.autoTranslateStoppedAfterTimeout', '首张翻译超时，已停止后续自动翻译'),
              detail: remainingCount > 0
                ? `首张截图在 ${Math.round(TRANSLATION_TIMEOUT_MS / 1000)} 秒内未返回，已停止剩余 ${remainingCount} 张`
                : `翻译在 ${Math.round(TRANSLATION_TIMEOUT_MS / 1000)} 秒内未返回，请稍后重试`,
              successCount: translated,
              failedCount: failed,
              skippedCount: skipped
            }, 7000);

            return { ok: false, translated, failed, skipped };
          }
        }
      }
    }

    const summaryDetail = `${t('alerts.translationSummary', '成功')} ${translated} · ${t('alerts.translationFailed', '失败')} ${failed}${timeoutCount > 0 ? ` · ${t('alerts.translationTimeout', '超时')} ${timeoutCount}` : ''}`;

    finishImportProgressState(jobId, {
      phase: 'translate',
      status: failed > 0 ? 'warning' : 'success',
      current: items.length,
      total: items.length,
      message: isManualMode
        ? (failed > 0 ? t('alerts.manualTranslatePartial', '手动翻译已完成，部分失败') : t('alerts.manualTranslateSuccess', '手动翻译已完成'))
        : isBatchMode
          ? (failed > 0 ? t('alerts.batchTranslatePartial', '批量翻译已完成，部分失败') : t('alerts.batchTranslateSuccess', '批量翻译已完成'))
        : (failed > 0 ? t('alerts.autoTranslatePartial', '自动翻译已完成，部分失败') : t('alerts.autoTranslateSuccess', '自动翻译已完成')),
      detail: summaryDetail,
      successCount: translated,
      failedCount: failed,
      skippedCount: skipped
    }, failed > 0 ? 6000 : 3000);

    return { ok: translated > 0, translated, failed, skipped };
  };

  const enqueueTranslationSequence = (items, options = {}) => {
    translationQueueRef.current = translationQueueRef.current
      .catch(() => undefined)
      .then(() => processTranslationSequence(items, options));

    return translationQueueRef.current;
  };

  const handleRetranslateSceneLanguage = async (targetLangCode) => {
    const sourceText = getSceneTitleByLanguage(activeScene, globalSettings.primaryLang).trim();
    if (!activeScene || isRetranslating || !sourceText || !targetLangCode) return;

    const jobId = startImportProgressJob();
    const targetLanguageInfo = getLanguageInfo(targetLangCode);
    updateImportProgressState(jobId, {
      phase: 'translate',
      status: 'queued',
      current: 0,
      total: 1,
      message: t('alerts.manualTranslateQueued', '已加入重新翻译队列'),
      detail: `${targetLanguageInfo?.nativeName || targetLangCode} · ${sourceText}`
    });
    setIsRetranslating(true);
    try {
      await enqueueTranslationSequence([
        {
          id: activeScene.id,
          sourceText,
          targetLangCode
        }
      ], { jobId, mode: 'manual' });
    } finally {
      setIsRetranslating(false);
    }
  };

  const handleBatchRetranslate = async () => {
    if (isBatchRetranslating) return;

    if (selectedSecondaryLangs.length === 0) {
      const jobId = startImportProgressJob();
      finishImportProgressState(jobId, {
        phase: 'translate',
        status: 'warning',
        current: 0,
        total: 0,
        message: t('alerts.batchTranslateMissingTarget', '未设置翻译语言，无法执行批量翻译'),
        detail: t('alerts.translationSetSecondaryLang', '请先在语言设置中选择翻译语言'),
        successCount: 0,
        failedCount: 0,
        skippedCount: 0
      }, 4000);
      return;
    }

    const translationTargets = scenes
      .filter(scene => scene.screenshot && getSceneTitleByLanguage(scene, globalSettings.primaryLang).trim())
      .flatMap(scene => {
        const sourceText = getSceneTitleByLanguage(scene, globalSettings.primaryLang).trim();
        return selectedSecondaryLangs.map(targetLangCode => ({
          id: scene.id,
          sourceText,
          targetLangCode
        }));
      });

    if (translationTargets.length === 0) {
      const jobId = startImportProgressJob();
      finishImportProgressState(jobId, {
        phase: 'translate',
        status: 'warning',
        current: 0,
        total: 0,
        message: t('alerts.batchTranslateNoScenes', '没有可批量翻译的截图'),
        detail: t('alerts.batchTranslateNoScenesDetail', '请先导入截图，或确认截图标题不为空'),
        successCount: 0,
        failedCount: 0,
        skippedCount: 0
      }, 4000);
      return;
    }

    const jobId = startImportProgressJob();
    updateImportProgressState(jobId, {
      phase: 'translate',
      status: 'queued',
      current: 0,
      total: translationTargets.length,
      message: t('alerts.batchTranslateQueued', '已加入批量翻译队列'),
      detail: `共 ${translationTargets.length} 个翻译任务等待执行`
    });

    setIsBatchRetranslating(true);
    try {
      await enqueueTranslationSequence(translationTargets, { jobId, mode: 'batch' });
    } finally {
      setIsBatchRetranslating(false);
    }
  };

  const applySceneSettingsPatch = useCallback((sceneId, updates) => {
    setScenes(prev => prev.map(scene => (
      scene.id === sceneId
        ? {
          ...scene,
          settings: { ...scene.settings, ...updates }
        }
        : scene
    )));
  }, []);

  const applyDeviceTransformPatch = useCallback((updates) => {
    if (updates.deviceScale !== undefined) {
      setDeviceScale(updates.deviceScale);
    }
    if (updates.deviceX !== undefined) {
      setDeviceX(updates.deviceX);
    }
    if (updates.deviceY !== undefined) {
      setDeviceY(updates.deviceY);
    }
  }, []);

  const updateSceneSettings = useCallback((key, value) => {
    applySceneSettingsPatch(activeScene.id, { [key]: value });
  }, [activeScene.id, applySceneSettingsPatch]);

  const updateSceneLanguageStyle = useCallback((sceneId, languageCode, updates) => {
    setScenes(prev => prev.map(scene => {
      if (scene.id !== sceneId) return scene;

      const nextSettings = {
        ...scene.settings,
        languageStyles: {
          ...(scene.settings?.languageStyles || {}),
          [languageCode]: {
            ...(scene.settings?.languageStyles?.[languageCode] || {}),
            ...updates
          }
        }
      };

      if (languageCode === globalSettings.primaryLang) {
        if (updates.textX !== undefined) nextSettings.textXCN = updates.textX;
        if (updates.textSize !== undefined) nextSettings.textSizeCN = updates.textSize;
        if (updates.textY !== undefined) nextSettings.textYCN = updates.textY;
      }

      if (selectedSecondaryLangs[0] && languageCode === selectedSecondaryLangs[0]) {
        if (updates.textX !== undefined) nextSettings.textXEN = updates.textX;
        if (updates.textSize !== undefined) nextSettings.textSizeEN = updates.textSize;
        if (updates.textY !== undefined) nextSettings.textYEN = updates.textY;
      }

      return {
        ...scene,
        settings: nextSettings
      };
    }));
  }, [globalSettings.primaryLang, selectedSecondaryLangs]);

  const resetSceneLanguageStyle = (sceneId, languageCode, key) => {
    const isPrimaryLanguage = languageCode === globalSettings.primaryLang;
    const fallbackValue = key === 'textSize'
      ? (isPrimaryLanguage ? DEFAULT_SCENE_SETTINGS.textSizeCN : DEFAULT_SCENE_SETTINGS.textSizeEN)
      : key === 'textX'
        ? (isPrimaryLanguage ? DEFAULT_SCENE_SETTINGS.textXCN : DEFAULT_SCENE_SETTINGS.textXEN)
        : (isPrimaryLanguage ? DEFAULT_SCENE_SETTINGS.textYCN : DEFAULT_SCENE_SETTINGS.textYEN);

    updateSceneLanguageStyle(sceneId, languageCode, { [key]: fallbackValue });
  };

  const updateGlobalLanguageStyle = (languageCode, updates) => {
    setGlobalSettings(prev => {
      const nextLanguageStyles = {
        ...(prev.languageTextStyles || {}),
        [languageCode]: {
          ...(prev.languageTextStyles?.[languageCode] || {}),
          ...updates
        }
      };

      const nextSettings = {
        ...prev,
        languageTextStyles: nextLanguageStyles
      };

      const normalizedSecondary = normalizeSecondaryLangs(prev.primaryLang, prev.secondaryLangs, prev.secondaryLang);
      const firstSecondaryLang = normalizedSecondary[0];

      if (languageCode === prev.primaryLang) {
        if (updates.font !== undefined) nextSettings.fontCN = updates.font;
        if (updates.textColor !== undefined) nextSettings.textColorCN = updates.textColor;
      }

      if (firstSecondaryLang && languageCode === firstSecondaryLang) {
        if (updates.font !== undefined) nextSettings.fontEN = updates.font;
        if (updates.textColor !== undefined) nextSettings.textColorEN = updates.textColor;
        if (updates.uppercase !== undefined) nextSettings.textUppercase = updates.uppercase;
      }

      return nextSettings;
    });
  };

  const applyPrimaryLanguage = (nextPrimaryLang) => {
    const nextSecondaryLangs = normalizeSecondaryLangs(
      nextPrimaryLang,
      globalSettings.secondaryLangs,
      globalSettings.secondaryLang
    );
    const nextConfiguredLanguages = [nextPrimaryLang, ...nextSecondaryLangs];

    setGlobalSettings(prev => ({
      ...prev,
      primaryLang: nextPrimaryLang,
      secondaryLangs: nextSecondaryLangs,
      secondaryLang: nextSecondaryLangs[0] || 'none'
    }));

    if (previewLanguage === globalSettings.primaryLang || !nextConfiguredLanguages.includes(previewLanguage)) {
      setPreviewLanguage(nextPrimaryLang);
    }

    setPrimaryLanguageMenuOpen(false);
    setTranslationLanguageMenuOpen(false);
  };

  const applySystemLanguage = () => {
    const systemLanguageCode = navigator.language;
    const matchedLanguage = LANGUAGES.find(
      lang => lang.code === systemLanguageCode || (systemLanguageCode.startsWith(lang.code) && lang.code !== 'none')
    )?.code || 'en';

    applyPrimaryLanguage(matchedLanguage);
  };

  const toggleSecondaryLanguage = (languageCode) => {
    setGlobalSettings(prev => {
      const nextSecondaryLangs = normalizeSecondaryLangs(prev.primaryLang, prev.secondaryLangs, prev.secondaryLang);
      const exists = nextSecondaryLangs.includes(languageCode);
      const updatedSecondaryLangs = exists
        ? nextSecondaryLangs.filter(lang => lang !== languageCode)
        : [...nextSecondaryLangs, languageCode];

      return {
        ...prev,
        secondaryLangs: updatedSecondaryLangs,
        secondaryLang: updatedSecondaryLangs[0] || 'none'
      };
    });
  };

  const resetSceneSetting = (key) => {
    updateSceneSettings(key, DEFAULT_SCENE_SETTINGS[key]);
  }

  const resetAlignmentGuides = useCallback(() => {
    setAlignmentGuides({ vertical: false, horizontal: false });
  }, []);

  const releasePointerDrag = useCallback(() => {
    if (pointerDragRef.current?.cleanup) {
      pointerDragRef.current.cleanup();
    }
    pointerDragRef.current = null;
  }, []);

  const suppressCanvasClickAfterOverlayInteraction = useCallback(() => {
    suppressCanvasClickUntilRef.current = Date.now() + 250;
  }, []);

  const queueDragPreview = useCallback((target, values) => {
    setDragPreview(prev => ({
      target,
      values: prev?.target === target
        ? { ...prev.values, ...values }
        : values
    }));
  }, []);

  const clearDragPreview = useCallback(() => {
    releasePointerDrag();
    resetAlignmentGuides();
    setDragPreview(null);
  }, [releasePointerDrag, resetAlignmentGuides]);

  const commitDragPreview = useCallback((expectedTarget = null) => {
    const preview = dragPreviewRef.current;
    if (!preview || (expectedTarget && preview.target !== expectedTarget)) {
      return;
    }

    if (preview.target === 'screenshot') {
      applySceneSettingsPatch(activeScene.id, preview.values);
    } else if (preview.target === 'device') {
      applyDeviceTransformPatch(preview.values);
    } else if (preview.target === 'text') {
      updateSceneLanguageStyle(activeScene.id, previewLanguage, preview.values);
    }

    releasePointerDrag();
    resetAlignmentGuides();
    setDragPreview(null);
  }, [activeScene.id, previewLanguage, releasePointerDrag, resetAlignmentGuides, applyDeviceTransformPatch, applySceneSettingsPatch, updateSceneLanguageStyle]);

  useEffect(() => {
    dragPreviewRef.current = dragPreview;
  }, [dragPreview]);

  useEffect(() => {
    clearDragPreview();
  }, [activeSceneId, previewLanguage, selectedElement, clearDragPreview]);

  useEffect(() => () => {
    releasePointerDrag();
  }, [releasePointerDrag]);

  useEffect(() => {
    const wasMockupEnabled = previousMockupEnabledRef.current;

    if (mockupEnabled && !wasMockupEnabled) {
      setSelectedElement('device');
    } else if (!mockupEnabled && selectedElement === 'device') {
      setSelectedElement('screenshot');
    }

    previousMockupEnabledRef.current = mockupEnabled;
  }, [mockupEnabled, selectedElement]);

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
      setScenes([createBlankScene(scenes[0].id, getDefaultSceneName(scenes[0].id))]);
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
      setScenes([createBlankScene(1, getDefaultSceneName(1))]);
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

    // Initialize Progress
    const scenesToExport = scenes.filter(s => s.screenshot);
    const exportLanguageCodes = allConfiguredLanguageCodes;
    const totalSteps = scenesToExport.length * exportLanguageCodes.length;
    isExportCancelled.current = false;
    setExportProgress({
      active: true,
      current: 0,
      total: totalSteps,
      message: t('export.preparing'),
      status: 'generating'
    });

    const tempCanvas = document.createElement('canvas');
    const exportFiles = [];

    // Helper to get Blob
    const getCanvasData = async (scene, lang) => {
      await drawCanvas(tempCanvas, scene, lang, true);
      return tempCanvas.toDataURL('image/jpeg', 0.9);
    };

    try {
      let completedCount = 0;

      for (const scene of scenesToExport) {
        const safeSceneName = scene.name ? scene.name.replace(/[\\/:*?"<>|]/g, '_').trim() : 'Screenshot';

        for (const languageCode of exportLanguageCodes) {
          if (isExportCancelled.current) {
            throw new Error('Cancelled by user');
          }

          const sceneName = scene.name || t('scenes.unnamed');
          const languageInfo = getLanguageInfo(languageCode);

          setExportProgress(prev => ({
            ...prev,
            current: completedCount + 1,
            message: `${t('export.exporting')} ${sceneName} · ${languageInfo?.nativeName || languageCode}`
          }));

          await new Promise(r => setTimeout(r, 0));

          const imageData = await getCanvasData(scene, languageCode);
          const folderName = languageInfo?.name || languageCode;
          exportFiles.push({ path: `${folderName}/${safeSceneName}.jpg`, data: imageData });

          completedCount++;
        }
      }

      // Check Cancellation before saving
      if (isExportCancelled.current) {
        throw new Error('Cancelled by user');
      }

      setExportProgress(prev => ({ ...prev, message: t('export.saving'), status: 'saving' }));

      // 2. Save via Electron
      const result = await window.electron.saveFiles({ basePath, files: exportFiles });

      if (result.success) {
        setExportProgress(prev => ({ ...prev, status: 'completed', message: t('export.completed') }));
      } else {
        setExportProgress(prev => ({ ...prev, status: 'error', message: result.error }));
      }
    } catch (error) {
      if (isExportCancelled.current) {
        setExportProgress(prev => ({ ...prev, status: 'cancelled', message: t('export.cancelled') }));
      } else {
        console.error('Export failed:', error);
        setExportProgress(prev => ({ ...prev, status: 'error', message: error.message }));
      }
    }
  };

  // 按设备导出 - 导出已配置设备的截图 (Refactored to support proper looping)
  const handleExportByDevice = async () => {
    if (appMode === 'icon') {
      window.dispatchEvent(new CustomEvent('trigger-icon-export'));
      return;
    }

    if (!window.electron) return alert(t('alerts.outputDirElectronOnly'));

    // 获取所有设备（包括复合设备如 Apple Family）
    const allDevices = Object.keys(DEVICE_CONFIGS);

    const basePath = await window.electron.selectDirectory();
    if (!basePath) return;

    // Initialize Progress
    const scenesToExport = scenes.filter(s => s.screenshot);
    const exportLanguageCodes = allConfiguredLanguageCodes;
    const totalSteps = allDevices.length * scenesToExport.length * exportLanguageCodes.length;

    isExportCancelled.current = false;
    setExportProgress({
      active: true,
      current: 0,
      total: totalSteps,
      message: t('export.preparing'),
      status: 'generating'
    });

    const tempCanvas = document.createElement('canvas');
    const exportFiles = [];

    try {
      let completedCount = 0;

      // 遍历每个设备
      // Use for..of loop to handle async await correctly
      for (const deviceId of allDevices) {
        if (isExportCancelled.current) throw new Error('Cancelled');

        const deviceConfig = DEVICE_CONFIGS[deviceId];
        if (!deviceConfig) continue;

        const deviceName = deviceConfig.name;

        // 遍历每个场景
        for (const scene of scenesToExport) {
          if (isExportCancelled.current) throw new Error('Cancelled');

          // 获取已保存的配置，如果没有则使用默认值
          const savedConfig = scene.settings?.deviceConfigs?.[deviceId] || {};

          // 准备覆盖配置 (Prepare Override Config)
          // These values will be passed directly to drawCanvas, bypassing state
          const overrideConfig = {
            mockupEnabled: true,
            selectedDevice: deviceId,
            deviceScale: savedConfig.scale ?? 1.0,
            deviceX: savedConfig.x ?? 0,
            deviceY: savedConfig.y ?? 400,
            deviceFrameColor: savedConfig.frameColor ?? deviceConfig.defaultFrameColor ?? '#C2BCB2',
            showLockScreenUI: savedConfig.showUI ?? false,
            showMockupShadow: savedConfig.showShadow ?? true,
            shadowOpacity: savedConfig.shadowOpacity ?? 0.5,
            // Important: We must load layers manually for export since we aren't using the hook's state
            deviceLayers: null
          };

          // Load layers for this device if needed
          if (deviceConfig.useSvgLayers && deviceConfig.svgPath) {
            try {
              const layers = await loadDeviceSvgLayers(
                deviceConfig.svgPath,
                {
                  frameColor: overrideConfig.deviceFrameColor,
                  showUI: overrideConfig.showLockScreenUI,
                  showShadow: true, // Always load shadow, visibility controlled by showMockupShadow in drawCanvas
                  deviceConfig: deviceConfig,
                }
              );
              overrideConfig.deviceLayers = layers;
            } catch (e) {
              console.warn(`Failed to export load layers for ${deviceId}:`, e);
            }
          }

          const safeSceneName = scene.name ? scene.name.replace(/[\\/:*?"<>|]/g, '_').trim() : 'Screenshot';

          for (const languageCode of exportLanguageCodes) {
            if (isExportCancelled.current) throw new Error('Cancelled');

            const languageInfo = getLanguageInfo(languageCode);
            setExportProgress(prev => ({
              ...prev,
              current: completedCount + 1,
              message: `${deviceName} · ${scene.name || t('scenes.unnamed')} · ${languageInfo?.nativeName || languageCode}`
            }));

            await new Promise(r => setTimeout(r, 0));

            await drawCanvas(tempCanvas, scene, languageCode, true, overrideConfig);
            const imageData = tempCanvas.toDataURL('image/jpeg', 0.9);
            const folderName = languageInfo?.name || languageCode;

            exportFiles.push({
              path: `${deviceName}/${folderName}/${safeSceneName}.jpg`,
              data: imageData
            });

            completedCount++;
          }
        }
      }

      if (isExportCancelled.current) throw new Error('Cancelled');

      setExportProgress(prev => ({ ...prev, message: t('export.saving'), status: 'saving' }));

      // 2. Save via Electron
      const result = await window.electron.saveFiles({ basePath, files: exportFiles });

      if (result.success) {
        setExportProgress(prev => ({ ...prev, status: 'completed', message: t('export.completed') }));
      } else {
        setExportProgress(prev => ({ ...prev, status: 'error', message: result.error }));
      }

    } catch (error) {
      if (isExportCancelled.current) {
        setExportProgress(prev => ({ ...prev, status: 'cancelled', message: t('export.cancelled') }));
      } else {
        console.error('Export failed:', error);
        setExportProgress(prev => ({ ...prev, status: 'error', message: error.message }));
      }
    }
  };



  // 导出菜单下拉状态
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef(null);
  useClickOutside(exportMenuRef, () => setExportMenuOpen(false));

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

  const batchTranslationTargetCount = scenes.filter(
    scene => scene.screenshot && getSceneTitleByLanguage(scene, globalSettings.primaryLang).trim()
  ).length;
  const batchTranslationJobCount = batchTranslationTargetCount * selectedSecondaryLangs.length;
  const hasTranslationLanguages = selectedSecondaryLangs.length > 0;
  const getTextAnchorX = (canvasWidth, textAlign, textOffsetX = 0) => {
    let baseX = canvasWidth / 2;
    if (textAlign === 'left') {
      baseX = canvasWidth * 0.1;
    } else if (textAlign === 'right') {
      baseX = canvasWidth * 0.9;
    }
    return baseX + textOffsetX;
  };
  const primaryLanguageInfo = getLanguageInfo(globalSettings.primaryLang);
  const previewLanguageOptions = [globalSettings.primaryLang, ...selectedSecondaryLangs];
  const previewLanguageInfo = getLanguageInfo(previewLanguage);
  const translationLanguageSummaryCode = selectedSecondaryLangs[0] || '';
  const translationLanguageSummaryInfo = getLanguageInfo(translationLanguageSummaryCode);
  const previewLanguageIsPrimary = previewLanguage === globalSettings.primaryLang;
  const previewLanguageRoleLabel = previewLanguageIsPrimary
    ? t('scenes.primaryLanguage')
    : t('scenes.translationLanguage');
  const previewLanguageTitle = getSceneTitleByLanguage(activeScene, previewLanguage);
  const previewTranslationLanguage = selectedSecondaryLangs.includes(previewLanguage)
    ? previewLanguage
    : null;
  const previewLanguageTextStyle = getGlobalLanguageStyle(previewLanguage);
  const previewSceneLanguageStyle = getSceneLanguageStyle(activeScene, previewLanguage);
  const sceneListPreviewLanguage = previewLanguage;
  const primarySceneTitle = getSceneTitleByLanguage(activeScene, globalSettings.primaryLang);
  const previewTranslationSourceText = primarySceneTitle.trim();
  const activeSceneSettings = { ...DEFAULT_SCENE_SETTINGS, ...(activeScene.settings || {}) };
  const previewedSceneSettings = dragPreview?.target === 'screenshot'
    ? { ...activeSceneSettings, ...dragPreview.values }
    : activeSceneSettings;
  const previewedTextStyle = dragPreview?.target === 'text'
    ? { ...previewSceneLanguageStyle, ...dragPreview.values }
    : previewSceneLanguageStyle;
  const previewedDeviceState = dragPreview?.target === 'device'
    ? {
      deviceScale: dragPreview.values.deviceScale ?? deviceScale,
      deviceX: dragPreview.values.deviceX ?? deviceX,
      deviceY: dragPreview.values.deviceY ?? deviceY,
    }
    : { deviceScale, deviceX, deviceY };

  const clampValue = (value, min, max) => Math.max(min, Math.min(max, value));
  const snapToStep = (value, step = 10) => Math.round(value / step) * step;

  const measureTextBounds = (scene, languageCode, textStyle) => {
    const resolvedLanguageCode = resolveCanvasLanguageCode(languageCode);
    const globalLanguageStyle = getGlobalLanguageStyle(resolvedLanguageCode);
    const isPrimaryLanguage = resolvedLanguageCode === globalSettings.primaryLang;
    let text = getSceneTitleByLanguage(scene, resolvedLanguageCode);

    if (!isPrimaryLanguage && globalLanguageStyle.uppercase && text) {
      text = text.toUpperCase();
    }

    if (!text) {
      return null;
    }

    if (!textMeasureCanvasRef.current) {
      textMeasureCanvasRef.current = document.createElement('canvas');
    }

    const measureCtx = textMeasureCanvasRef.current.getContext('2d');
    if (!measureCtx) {
      return null;
    }

    const { width } = globalSettings;
    const fontSize = textStyle.textSize;
    const fontFamily = globalLanguageStyle.font;
    const textOffsetX = textStyle.textX || 0;
    const lines = text.split('\n');
    const lineHeight = fontSize * 1.2;
    const textAlign = globalSettings.textAlign || 'center';

    measureCtx.font = `bold ${fontSize}px ${fontFamily}`;

    const widestLine = lines.reduce((maxWidth, line) => {
      const lineWidth = measureCtx.measureText(line || ' ').width;
      return Math.max(maxWidth, lineWidth);
    }, 0);

    const textX = getTextAnchorX(width, textAlign, textOffsetX);
    let x = textX;
    if (textAlign === 'center') {
      x -= widestLine / 2;
    } else if (textAlign === 'right') {
      x -= widestLine;
    }

    const textHeight = fontSize + Math.max(0, lines.length - 1) * lineHeight;
    const strokePadding = globalSettings.textStroke
      ? fontSize * ((globalSettings.strokeWidth || 4) / 100)
      : 0;
    const shadowBlur = globalSettings.textShadow ? fontSize * 0.15 : 0;
    const shadowOffsetY = globalSettings.textShadow ? fontSize * 0.05 : 0;
    const paddingX = Math.max(12, strokePadding + shadowBlur * 0.8);
    const paddingTop = Math.max(10, strokePadding + shadowBlur * 0.4);
    const paddingBottom = Math.max(14, strokePadding + shadowBlur + shadowOffsetY);

    return {
      x: x - paddingX,
      y: textStyle.textY - paddingTop,
      width: widestLine + paddingX * 2,
      height: textHeight + paddingTop + paddingBottom
    };
  };

  const computeElementBounds = (scene, previewState = null) => {
    if (!scene) return {};

    const { width, height } = globalSettings;
    const backgroundSettings = previewState?.target === 'background'
      ? { ...globalSettings, ...previewState.values }
      : globalSettings;
    const effectiveDeviceScale = previewState?.target === 'device'
      ? (previewState.values.deviceScale ?? deviceScale)
      : deviceScale;
    const effectiveDeviceX = previewState?.target === 'device'
      ? (previewState.values.deviceX ?? deviceX)
      : deviceX;
    const effectiveDeviceY = previewState?.target === 'device'
      ? (previewState.values.deviceY ?? deviceY)
      : deviceY;
    const sceneSettings = previewState?.target === 'screenshot'
      ? { ...DEFAULT_SCENE_SETTINGS, ...(scene.settings || {}), ...previewState.values }
      : { ...DEFAULT_SCENE_SETTINGS, ...(scene.settings || {}) };
    const textStyle = previewState?.target === 'text'
      ? { ...getSceneLanguageStyle(scene, previewLanguage), ...previewState.values }
      : getSceneLanguageStyle(scene, previewLanguage);

    const bounds = {
      background: { x: 0, y: 0, width, height }
    };

    if ((backgroundSettings.backgroundType === 'upload' || backgroundSettings.backgroundType === 'builtin') && backgroundSettings.backgroundUpload) {
      const backgroundDimensions = getCachedImageDimensions(backgroundSettings.backgroundUpload);
      if (backgroundDimensions) {
        const ratio = Math.max(width / backgroundDimensions.width, height / backgroundDimensions.height);
        const scale = ratio * (backgroundSettings.backgroundScale || 1.0);
        const bgWidth = backgroundDimensions.width * scale;
        const bgHeight = backgroundDimensions.height * scale;

        bounds.background = {
          x: (width - bgWidth) / 2 + (backgroundSettings.backgroundX || 0),
          y: (height - bgHeight) / 2 + (backgroundSettings.backgroundY || 0),
          width: bgWidth,
          height: bgHeight
        };
      }
    }

    const measuredTextBounds = measureTextBounds(scene, previewLanguage, textStyle);
    if (measuredTextBounds) {
      bounds.text = measuredTextBounds;
    }

    if (!scene.screenshot) {
      return bounds;
    }

    const screenshotDimensions = getCachedImageDimensions(scene.screenshot);
    const screenshotAspect = screenshotDimensions
      ? screenshotDimensions.width / screenshotDimensions.height
      : (16 / 9);

    if (mockupEnabled && DEVICE_CONFIGS[selectedDevice]) {
      const deviceConfig = DEVICE_CONFIGS[selectedDevice];
      const ssScale = sceneSettings.screenshotScale ?? 1.0;

      if (deviceConfig.isComposite && deviceConfig.devices && deviceConfig.layout) {
        const REF_WIDTH = 2880;
        const REF_HEIGHT = 1800;
        const baseRatio = width / REF_WIDTH;
        const groupScale = effectiveDeviceScale || 1.0;
        const groupOffsetX = effectiveDeviceX || 0;
        const groupOffsetY = effectiveDeviceY || 0;
        let union = null;
        let deviceUnion = null;

        deviceConfig.devices.forEach(deviceId => {
          const config = DEVICE_CONFIGS[deviceId];
          const layoutConfig = deviceConfig.layout[deviceId];
          if (!config || !layoutConfig) return;

          const screen = { ...config.screen };
          const frameSize = { ...config.frameSize };
          const refDeviceWidth = REF_WIDTH * layoutConfig.scale;
          const deviceScaleRatio = (refDeviceWidth * baseRatio * groupScale) / frameSize.width;
          const scaledFrameWidth = frameSize.width * deviceScaleRatio;
          const scaledFrameHeight = frameSize.height * deviceScaleRatio;
          const scaledScreenWidth = screen.width * deviceScaleRatio;
          const scaledScreenHeight = screen.height * deviceScaleRatio;
          const scaledScreenX = screen.x * deviceScaleRatio;
          const scaledScreenY = screen.y * deviceScaleRatio;

          const refCenterX = REF_WIDTH * layoutConfig.x;
          const refCenterY = REF_HEIGHT * layoutConfig.y;
          const refOffsetX = refCenterX - REF_WIDTH * 0.5;
          const refOffsetY = refCenterY - REF_HEIGHT * 0.5;
          const finalCenterX = width * 0.5 + (refOffsetX * baseRatio * groupScale) + groupOffsetX;
          const finalCenterY = height * 0.5 + (refOffsetY * baseRatio * groupScale) + groupOffsetY;
          const frameX = finalCenterX - scaledFrameWidth / 2;
          const frameY = finalCenterY - scaledFrameHeight / 2;
          const frameBox = {
            x: frameX,
            y: frameY,
            width: scaledFrameWidth,
            height: scaledFrameHeight
          };

          if (!deviceUnion) {
            deviceUnion = frameBox;
          } else {
            const maxFrameX = Math.max(deviceUnion.x + deviceUnion.width, frameBox.x + frameBox.width);
            const maxFrameY = Math.max(deviceUnion.y + deviceUnion.height, frameBox.y + frameBox.height);
            deviceUnion = {
              x: Math.min(deviceUnion.x, frameBox.x),
              y: Math.min(deviceUnion.y, frameBox.y),
              width: maxFrameX - Math.min(deviceUnion.x, frameBox.x),
              height: maxFrameY - Math.min(deviceUnion.y, frameBox.y)
            };
          }

          const screenAspect = scaledScreenWidth / scaledScreenHeight;
          let baseDrawWidth;
          let baseDrawHeight;

          if (screenshotAspect > screenAspect) {
            baseDrawHeight = scaledScreenHeight;
            baseDrawWidth = baseDrawHeight * screenshotAspect;
          } else {
            baseDrawWidth = scaledScreenWidth;
            baseDrawHeight = baseDrawWidth / screenshotAspect;
          }

          const drawWidth = baseDrawWidth * ssScale;
          const drawHeight = baseDrawHeight * ssScale;
          const drawX = frameX + scaledScreenX + (scaledScreenWidth - drawWidth) / 2 + (sceneSettings.screenshotX || 0) * deviceScaleRatio;
          const drawY = frameY + scaledScreenY + (scaledScreenHeight - drawHeight) / 2 + (sceneSettings.screenshotY || 0) * deviceScaleRatio;

          const nextBox = { x: drawX, y: drawY, width: drawWidth, height: drawHeight };
          if (!union) {
            union = nextBox;
            return;
          }

          const maxX = Math.max(union.x + union.width, nextBox.x + nextBox.width);
          const maxY = Math.max(union.y + union.height, nextBox.y + nextBox.height);
          union = {
            x: Math.min(union.x, nextBox.x),
            y: Math.min(union.y, nextBox.y),
            width: maxX - Math.min(union.x, nextBox.x),
            height: maxY - Math.min(union.y, nextBox.y)
          };
        });

        if (union) {
          bounds.screenshot = union;
        }
        if (deviceUnion) {
          bounds.device = deviceUnion;
        }

        return bounds;
      }

      let screen = { ...deviceConfig.screen };
      let frameSize = { ...deviceConfig.frameSize };

      if (selectedDevice === 'ipad-pro' && !iPadLandscape) {
        screen = {
          x: deviceConfig.screen.y,
          y: deviceConfig.screen.x,
          width: deviceConfig.screen.height,
          height: deviceConfig.screen.width,
        };
        frameSize = {
          width: deviceConfig.frameSize.height,
          height: deviceConfig.frameSize.width,
        };
      }

      const baseDeviceWidth = width * 0.35;
      const baseDeviceHeight = height * 0.6;
      const scaleRatio = Math.min(
        baseDeviceWidth / frameSize.width,
        baseDeviceHeight / frameSize.height
      ) * (effectiveDeviceScale || 1.0);

      const scaledScreenWidth = screen.width * scaleRatio;
      const scaledScreenHeight = screen.height * scaleRatio;
      const scaledScreenX = screen.x * scaleRatio;
      const scaledScreenY = screen.y * scaleRatio;
      const scaledFrameWidth = frameSize.width * scaleRatio;
      const scaledFrameHeight = frameSize.height * scaleRatio;
      const screenAspect = scaledScreenWidth / scaledScreenHeight;
      let baseDrawWidth;
      let baseDrawHeight;

      if (screenshotAspect > screenAspect) {
        baseDrawHeight = scaledScreenHeight;
        baseDrawWidth = baseDrawHeight * screenshotAspect;
      } else {
        baseDrawWidth = scaledScreenWidth;
        baseDrawHeight = baseDrawWidth / screenshotAspect;
      }

      const drawWidth = baseDrawWidth * ssScale;
      const drawHeight = baseDrawHeight * ssScale;
      const frameX = (width - scaledFrameWidth) / 2 + effectiveDeviceX;
      const frameY = effectiveDeviceY;

      bounds.device = {
        x: frameX,
        y: frameY,
        width: scaledFrameWidth,
        height: scaledFrameHeight
      };

      bounds.screenshot = {
        x: frameX + scaledScreenX + (scaledScreenWidth - drawWidth) / 2 + (sceneSettings.screenshotX || 0) * scaleRatio,
        y: frameY + scaledScreenY + (scaledScreenHeight - drawHeight) / 2 + (sceneSettings.screenshotY || 0) * scaleRatio,
        width: drawWidth,
        height: drawHeight
      };

      return bounds;
    }

    const targetWidth = width * 0.6 * (sceneSettings.screenshotScale ?? DEFAULT_SCENE_SETTINGS.screenshotScale);
    const targetHeight = targetWidth / screenshotAspect;
    bounds.screenshot = {
      x: (width - targetWidth) / 2 + (sceneSettings.screenshotX || 0),
      y: sceneSettings.screenshotY ?? DEFAULT_SCENE_SETTINGS.screenshotY,
      width: targetWidth,
      height: targetHeight
    };

    return bounds;
  };

  const elementBounds = computeElementBounds(activeScene);
  const previewBounds = dragPreview ? computeElementBounds(activeScene, dragPreview) : null;
  const previewOverlayKey = dragPreview?.target;
  const activeElementTab = selectedElement === 'device' ? 'screenshot' : selectedElement;
  const selectedOverlayBounds = selectedElement
    ? (selectedElement === 'background'
      ? { x: 0, y: 0, width: globalSettings.width, height: globalSettings.height }
      : (previewBounds?.[selectedElement] || elementBounds[selectedElement]))
    : null;
  const floatingPreviewBounds = previewOverlayKey && previewOverlayKey !== selectedElement
    ? previewBounds?.[previewOverlayKey]
    : null;

  const getOverlayStyle = (box) => {
    if (!box) return null;

    return {
      left: `${(box.x / globalSettings.width) * 100}%`,
      top: `${(box.y / globalSettings.height) * 100}%`,
      width: `${(box.width / globalSettings.width) * 100}%`,
      height: `${(box.height / globalSettings.height) * 100}%`,
    };
  };

  const getTargetPreviewState = (target) => {
    if (target === 'text') {
      return {
        textX: previewedTextStyle.textX || 0,
        textY: previewedTextStyle.textY,
        textSize: previewedTextStyle.textSize
      };
    }

    if (target === 'screenshot') {
      return {
        screenshotX: previewedSceneSettings.screenshotX || 0,
        screenshotY: previewedSceneSettings.screenshotY ?? DEFAULT_SCENE_SETTINGS.screenshotY,
        screenshotScale: previewedSceneSettings.screenshotScale
      };
    }

    if (target === 'device') {
      return {
        deviceX: previewedDeviceState.deviceX,
        deviceY: previewedDeviceState.deviceY,
        deviceScale: previewedDeviceState.deviceScale
      };
    }

    return {};
  };

  const normalizeTargetValue = (target, key, value) => {
    if (key === 'textSize') {
      return clampValue(snapToStep(value, 5), 40, 300);
    }

    if (key === 'screenshotScale') {
      return clampValue(Number(value.toFixed(2)), 0.3, 3.0);
    }

    if (key === 'deviceScale') {
      return clampValue(Number(value.toFixed(2)), 0.3, 4.0);
    }

    if (key === 'backgroundX' || key === 'backgroundY') {
      return clampValue(snapToStep(value), -1500, 1500);
    }

    if (key === 'textX') {
      return clampValue(snapToStep(value), -1200, 1200);
    }

    if (key === 'textY') {
      return clampValue(snapToStep(value), 50, 1000);
    }

    if (key === 'screenshotX' || key === 'screenshotY' || key === 'deviceX' || key === 'deviceY') {
      return clampValue(snapToStep(value), -1000, 1000);
    }

    return value;
  };

  const pickTargetPreviewState = (target, values) => {
    if (target === 'text') {
      return {
        textX: values.textX,
        textY: values.textY,
        textSize: values.textSize
      };
    }

    if (target === 'screenshot') {
      return {
        screenshotX: values.screenshotX,
        screenshotY: values.screenshotY,
        screenshotScale: values.screenshotScale
      };
    }

    if (target === 'device') {
      return {
        deviceX: values.deviceX,
        deviceY: values.deviceY,
        deviceScale: values.deviceScale
      };
    }

    return values;
  };

  const applyCenterSnap = (target, draftValues) => {
    const nextValues = { ...getTargetPreviewState(target), ...draftValues };
    const nextGuides = { vertical: false, horizontal: false };
    const axisMap = {
      text: { x: 'textX', y: 'textY' },
      screenshot: { x: 'screenshotX', y: 'screenshotY' },
      device: { x: 'deviceX', y: 'deviceY' }
    };
    const targetAxisMap = axisMap[target];

    if (!targetAxisMap) {
      return { values: draftValues, guides: nextGuides };
    }

    const applyAxisSnap = (axis, guideKey) => {
      const key = targetAxisMap[axis];
      let currentBox = computeElementBounds(activeScene, { target, values: nextValues })[target];
      if (!currentBox || nextValues[key] === undefined) {
        return;
      }

      const currentCenter = axis === 'x'
        ? currentBox.x + currentBox.width / 2
        : currentBox.y + currentBox.height / 2;
      const canvasCenter = axis === 'x'
        ? globalSettings.width / 2
        : globalSettings.height / 2;
      const diff = currentCenter - canvasCenter;

      if (Math.abs(diff) > CENTER_SNAP_THRESHOLD) {
        return;
      }

      const epsilonValues = {
        ...nextValues,
        [key]: nextValues[key] + 1
      };
      const epsilonBox = computeElementBounds(activeScene, { target, values: epsilonValues })[target];
      if (!epsilonBox) {
        return;
      }

      const epsilonCenter = axis === 'x'
        ? epsilonBox.x + epsilonBox.width / 2
        : epsilonBox.y + epsilonBox.height / 2;
      const pixelsPerUnit = epsilonCenter - currentCenter;

      if (Math.abs(pixelsPerUnit) < 0.001) {
        return;
      }

      nextValues[key] = normalizeTargetValue(target, key, nextValues[key] - (diff / pixelsPerUnit));
      nextGuides[guideKey] = true;
    };

    applyAxisSnap('x', 'vertical');
    applyAxisSnap('y', 'horizontal');

    return {
      values: pickTargetPreviewState(target, nextValues),
      guides: nextGuides
    };
  };

  const applyResizeFromCenter = (target, draftValues, anchorCenter) => {
    const axisMap = {
      text: { x: 'textX', y: 'textY' },
      screenshot: { x: 'screenshotX', y: 'screenshotY' },
      device: { x: 'deviceX', y: 'deviceY' }
    };
    const targetAxisMap = axisMap[target];
    const adjustedValues = { ...getTargetPreviewState(target), ...draftValues };

    if (!targetAxisMap) {
      return pickTargetPreviewState(target, adjustedValues);
    }

    const adjustAxisToAnchor = (axis) => {
      const key = targetAxisMap[axis];

      if (adjustedValues[key] === undefined) {
        return;
      }

      const currentBox = computeElementBounds(activeScene, { target, values: adjustedValues })[target];
      if (!currentBox) {
        return;
      }

      const currentCenter = axis === 'x'
        ? currentBox.x + currentBox.width / 2
        : currentBox.y + currentBox.height / 2;
      const desiredCenter = axis === 'x' ? anchorCenter.x : anchorCenter.y;
      const diff = currentCenter - desiredCenter;

      if (Math.abs(diff) < 0.1) {
        return;
      }

      const epsilonValues = {
        ...adjustedValues,
        [key]: adjustedValues[key] + 1
      };
      const epsilonBox = computeElementBounds(activeScene, { target, values: epsilonValues })[target];
      if (!epsilonBox) {
        return;
      }

      const epsilonCenter = axis === 'x'
        ? epsilonBox.x + epsilonBox.width / 2
        : epsilonBox.y + epsilonBox.height / 2;
      const pixelsPerUnit = epsilonCenter - currentCenter;

      if (Math.abs(pixelsPerUnit) < 0.001) {
        return;
      }

      adjustedValues[key] = normalizeTargetValue(
        target,
        key,
        adjustedValues[key] - (diff / pixelsPerUnit)
      );
    };

    adjustAxisToAnchor('x');
    adjustAxisToAnchor('y');

    return pickTargetPreviewState(target, adjustedValues);
  };

  const handleCanvasClick = (event) => {
    if (Date.now() <= suppressCanvasClickUntilRef.current) {
      suppressCanvasClickUntilRef.current = 0;
      return;
    }

    if (!canvasRef.current || !activeScene) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = globalSettings.width / rect.width;
    const scaleY = globalSettings.height / rect.height;
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    const hitTest = (box, padding = 0) => box
      && canvasX >= box.x - padding
      && canvasX <= box.x + box.width + padding
      && canvasY >= box.y - padding
      && canvasY <= box.y + box.height + padding;
    const textHit = hitTest(elementBounds.text, 8);
    const deviceHit = mockupEnabled && hitTest(elementBounds.device, 6);
    const screenshotHit = mockupEnabled
      ? deviceHit && hitTest(elementBounds.screenshot, 0)
      : hitTest(elementBounds.screenshot, 0);

    const selectMediaTarget = () => {
      if (mockupEnabled && (deviceHit || screenshotHit)) {
        if (selectedElement === 'screenshot' && screenshotHit) {
          setSelectedElement('screenshot');
        } else if (deviceHit) {
          setSelectedElement('device');
        } else if (screenshotHit) {
          setSelectedElement('screenshot');
        }
        return true;
      }

      if (screenshotHit) {
        setSelectedElement('screenshot');
        return true;
      }

      return false;
    };

    if (globalSettings.textOnTop) {
      if (textHit) {
        setSelectedElement('text');
        return;
      }
      if (selectMediaTarget()) {
        return;
      }
    } else {
      if (selectMediaTarget()) {
        return;
      }
      if (textHit) {
        setSelectedElement('text');
        return;
      }
    }

    setSelectedElement('background');
  };

  const handleCanvasPointerDown = (event) => {
    if (!canvasRef.current || !activeScene || selectedElement !== 'background') {
      return;
    }

    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = globalSettings.width / rect.width;
    const scaleY = globalSettings.height / rect.height;
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    const hitTest = (box, padding = 0) => box
      && canvasX >= box.x - padding
      && canvasX <= box.x + box.width + padding
      && canvasY >= box.y - padding
      && canvasY <= box.y + box.height + padding;
    const textHit = hitTest(elementBounds.text, 8);
    const deviceHit = mockupEnabled && hitTest(elementBounds.device, 6);
    const screenshotHit = mockupEnabled
      ? deviceHit && hitTest(elementBounds.screenshot, 0)
      : hitTest(elementBounds.screenshot, 0);

    if (textHit || deviceHit || screenshotHit) {
      return;
    }

    event.preventDefault();
    releasePointerDrag();

    const startX = event.clientX;
    const startY = event.clientY;
    const startBackgroundX = globalSettings.backgroundX || 0;
    const startBackgroundY = globalSettings.backgroundY || 0;

    const onMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) * scaleX;
      const deltaY = (moveEvent.clientY - startY) * scaleY;
      const nextBackgroundX = normalizeTargetValue('background', 'backgroundX', startBackgroundX + deltaX);
      const nextBackgroundY = normalizeTargetValue('background', 'backgroundY', startBackgroundY + deltaY);
      const shouldSnapX = Math.abs(nextBackgroundX) <= CENTER_SNAP_THRESHOLD;
      const shouldSnapY = Math.abs(nextBackgroundY) <= CENTER_SNAP_THRESHOLD;

      setAlignmentGuides({ vertical: shouldSnapX, horizontal: shouldSnapY });
      setGlobalSettings(settings => ({
        ...settings,
        backgroundX: shouldSnapX ? 0 : nextBackgroundX,
        backgroundY: shouldSnapY ? 0 : nextBackgroundY
      }));
    };

    const onUp = () => {
      resetAlignmentGuides();
      releasePointerDrag();
    };

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    pointerDragRef.current = { cleanup };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };

  const handleSelectionOverlayPointerDown = (event) => {
    if (!canvasRef.current || !activeScene || !['background', 'text', 'screenshot', 'device'].includes(selectedElement)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    releasePointerDrag();

    const dragTarget = selectedElement;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = globalSettings.width / rect.width;
    const scaleY = globalSettings.height / rect.height;
    const startX = event.clientX;
    const startY = event.clientY;
    const startBackgroundX = globalSettings.backgroundX || 0;
    const startBackgroundY = globalSettings.backgroundY || 0;
    const startTextX = previewedTextStyle.textX || 0;
    const startTextY = previewedTextStyle.textY;
    const startScreenshotX = previewedSceneSettings.screenshotX || 0;
    const startScreenshotY = previewedSceneSettings.screenshotY ?? DEFAULT_SCENE_SETTINGS.screenshotY;
    const startDeviceX = previewedDeviceState.deviceX;
    const startDeviceY = previewedDeviceState.deviceY;

    const onMove = (moveEvent) => {
      const deltaX = (moveEvent.clientX - startX) * scaleX;
      const deltaY = (moveEvent.clientY - startY) * scaleY;

      if (dragTarget === 'background') {
        const nextBackgroundX = normalizeTargetValue('background', 'backgroundX', startBackgroundX + deltaX);
        const nextBackgroundY = normalizeTargetValue('background', 'backgroundY', startBackgroundY + deltaY);
        const shouldSnapX = Math.abs(nextBackgroundX) <= CENTER_SNAP_THRESHOLD;
        const shouldSnapY = Math.abs(nextBackgroundY) <= CENTER_SNAP_THRESHOLD;

        setAlignmentGuides({ vertical: shouldSnapX, horizontal: shouldSnapY });
        setGlobalSettings(settings => ({
          ...settings,
          backgroundX: shouldSnapX ? 0 : nextBackgroundX,
          backgroundY: shouldSnapY ? 0 : nextBackgroundY
        }));
        return;
      }

      if (dragTarget === 'text') {
        const snappedPreview = applyCenterSnap('text', {
          textX: clampValue(snapToStep(startTextX + deltaX), -1200, 1200),
          textY: clampValue(snapToStep(startTextY + deltaY), 50, 1000)
        });
        setAlignmentGuides(snappedPreview.guides);
        queueDragPreview('text', snappedPreview.values);
        return;
      }

      if (dragTarget === 'device') {
        const snappedPreview = applyCenterSnap('device', {
          deviceX: clampValue(snapToStep(startDeviceX + deltaX), -1000, 1000),
          deviceY: clampValue(snapToStep(startDeviceY + deltaY), -1000, 1000)
        });
        setAlignmentGuides(snappedPreview.guides);
        queueDragPreview('device', snappedPreview.values);
        return;
      }

      const snappedPreview = applyCenterSnap('screenshot', {
        screenshotX: clampValue(snapToStep(startScreenshotX + deltaX), -1000, 1000),
        screenshotY: clampValue(snapToStep(startScreenshotY + deltaY), -1000, 1000)
      });
      setAlignmentGuides(snappedPreview.guides);
      queueDragPreview('screenshot', snappedPreview.values);
    };

    const onUp = () => {
      suppressCanvasClickAfterOverlayInteraction();

      if (dragTarget === 'background') {
        resetAlignmentGuides();
        releasePointerDrag();
        return;
      }

      commitDragPreview(dragTarget);
    };

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    pointerDragRef.current = { cleanup };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };

  const handleSelectionResizePointerDown = (event) => {
    if (!canvasRef.current || !activeScene || !['text', 'screenshot', 'device'].includes(selectedElement)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    releasePointerDrag();

    const resizeTarget = selectedElement;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = globalSettings.width / rect.width;
    const scaleY = globalSettings.height / rect.height;
    const activeBox = previewBounds?.[resizeTarget] || elementBounds[resizeTarget];

    if (!activeBox) {
      return;
    }

    const centerX = activeBox.x + activeBox.width / 2;
    const centerY = activeBox.y + activeBox.height / 2;
    const startPointX = (event.clientX - rect.left) * scaleX;
    const startPointY = (event.clientY - rect.top) * scaleY;
    const startDistance = Math.max(40, Math.hypot(startPointX - centerX, startPointY - centerY));
    const startTextSize = previewedTextStyle.textSize;
    const startScreenshotScale = previewedSceneSettings.screenshotScale;
    const startDeviceScale = previewedDeviceState.deviceScale;

    const onMove = (moveEvent) => {
      const pointX = (moveEvent.clientX - rect.left) * scaleX;
      const pointY = (moveEvent.clientY - rect.top) * scaleY;
      const nextDistance = Math.max(40, Math.hypot(pointX - centerX, pointY - centerY));
      const scaleRatio = nextDistance / startDistance;

      if (resizeTarget === 'text') {
        queueDragPreview('text', applyResizeFromCenter('text', {
          textSize: clampValue(snapToStep(startTextSize * scaleRatio, 5), 40, 300)
        }, { x: centerX, y: centerY }));
        return;
      }

      if (resizeTarget === 'device') {
        queueDragPreview('device', applyResizeFromCenter('device', {
          deviceScale: clampValue(Number((startDeviceScale * scaleRatio).toFixed(2)), 0.3, 4.0)
        }, { x: centerX, y: centerY }));
        return;
      }

      queueDragPreview('screenshot', applyResizeFromCenter('screenshot', {
        screenshotScale: clampValue(Number((startScreenshotScale * scaleRatio).toFixed(2)), 0.3, 3.0)
      }, { x: centerX, y: centerY }));
    };

    const onUp = () => {
      suppressCanvasClickAfterOverlayInteraction();
      commitDragPreview(resizeTarget);
    };

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    pointerDragRef.current = { cleanup };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };

  const handleElementTabSelect = (tabId) => {
    if (tabId !== 'screenshot') {
      setSelectedElement(tabId);
      return;
    }

    setSelectedElement(current => (current === 'device' ? 'device' : 'screenshot'));
  };

  const elementTabs = [
    { id: 'background', icon: ImageIcon, label: t('rightPanel.elementBackground') },
    { id: 'text', icon: Type, label: t('rightPanel.elementText') },
    { id: 'screenshot', icon: Monitor, label: t('rightPanel.elementScreenshot') },
  ];

  const renderBackgroundSettingsPanel = () => (
    <div className="p-5 border-b border-[var(--app-border)] element-panel">
      <div className="bg-[var(--app-card-bg)] rounded-lg p-3 border border-[var(--app-border)]">
        <button
          onClick={() => setBgExpanded(!bgExpanded)}
          className="w-full text-xs text-[var(--app-text-secondary)] font-semibold tracking-[0.02em] mb-2 flex items-center gap-2 hover:text-[var(--app-text-primary)] transition"
        >
          <ChevronDown className={`w-3 h-3 transition-transform ${bgExpanded ? '' : '-rotate-90'}`} />
          <ImageIcon className="w-4 h-4" /> {t('sidebar.globalBackground')}
          {uploadedBackgrounds.length > 0 && (
            <span className="ml-auto text-[10px] text-[var(--app-text-muted)] font-normal">
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
                  title={getBackgroundPresetName(p.id, p.name)}
                />
              ))}
              <button
                onClick={() => {
                  setGlobalSettings(s => {
                    let initialGradient = s.customGradient || { color1: '#FFFFFF', color2: '#9CA3AF', angle: 180, stop1: 0, stop2: 100 };

                    if (s.backgroundType === 'preset' && s.backgroundValue) {
                      const val = s.backgroundValue;
                      if (val.startsWith('#')) {
                        initialGradient = { color1: val, color2: val, angle: 180, stop1: 0, stop2: 100 };
                      } else if (val.includes('linear-gradient')) {
                        const angleMatch = val.match(/(\d+)deg/);
                        const angle = angleMatch ? parseInt(angleMatch[1]) : 180;
                        const colors = val.match(/#[a-fA-F0-9]{6}/g);
                        if (colors && colors.length >= 2) {
                          initialGradient = {
                            color1: colors[0],
                            color2: colors[colors.length - 1],
                            angle,
                            stop1: 0,
                            stop2: 100
                          };
                        }
                      }
                    }

                    return {
                      ...s,
                      backgroundType: 'custom-gradient',
                      customGradient: initialGradient
                    };
                  });
                }}
                className={`w-full h-8 rounded-md transition-all flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden ${globalSettings.backgroundType === 'custom-gradient' ? 'ring-2 ring-blue-500 scale-110 z-10' : 'opacity-70 hover:opacity-100'}`}
                title={t('sidebar.customGradient')}
              >
                <Palette className="w-4 h-4 text-white drop-shadow-sm" />
              </button>
            </div>

            {globalSettings.backgroundType === 'custom-gradient' && (
              <div className="mb-3 p-3 bg-[var(--app-card-bg-solid)] rounded-lg border border-[var(--app-border)] space-y-3 element-subpanel">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-[var(--app-text-secondary)] block mb-1">{t('sidebar.gradientStartColor')}</label>
                    <div className="flex items-center gap-2 bg-black/20 p-1 rounded border border-white/5">
                      <div className="relative w-6 h-6 rounded overflow-hidden flex-shrink-0">
                        <input type="color"
                          value={globalSettings.customGradient?.color1 || '#FFFFFF'}
                          onChange={(e) => setGlobalSettings(s => ({ ...s, customGradient: { ...(s.customGradient || { color1: '#FFFFFF', color2: '#9CA3AF', angle: 180 }), color1: e.target.value } }))}
                          className="absolute -top-1 -left-1 w-8 h-8 p-0 cursor-pointer border-0"
                        />
                      </div>
                      <span className="text-[10px] font-mono text-[var(--app-text-muted)] uppercase flex-1 text-center">{globalSettings.customGradient?.color1 || '#FFFFFF'}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-[var(--app-text-secondary)] block mb-1">{t('sidebar.gradientEndColor')}</label>
                    <div className="flex items-center gap-2 bg-black/20 p-1 rounded border border-white/5">
                      <div className="relative w-6 h-6 rounded overflow-hidden flex-shrink-0">
                        <input type="color"
                          value={globalSettings.customGradient?.color2 || '#9CA3AF'}
                          onChange={(e) => setGlobalSettings(s => ({ ...s, customGradient: { ...(s.customGradient || { color1: '#FFFFFF', color2: '#9CA3AF', angle: 180 }), color2: e.target.value } }))}
                          className="absolute -top-1 -left-1 w-8 h-8 p-0 cursor-pointer border-0"
                        />
                      </div>
                      <span className="text-[10px] font-mono text-[var(--app-text-muted)] uppercase flex-1 text-center">{globalSettings.customGradient?.color2 || '#9CA3AF'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-[10px] text-[var(--app-text-secondary)]">{t('sidebar.gradientAngle')}</label>
                    <span className="text-[10px] text-[var(--app-text-muted)]">{globalSettings.customGradient?.angle ?? 180}°</span>
                  </div>
                  <input
                    type="range" min="0" max="360" step="45"
                    value={globalSettings.customGradient?.angle ?? 180}
                    onChange={(e) => setGlobalSettings(s => ({ ...s, customGradient: { ...(s.customGradient || { color1: '#FFFFFF', color2: '#9CA3AF', angle: 180 }), angle: parseInt(e.target.value) } }))}
                    className="w-full h-1 bg-[var(--app-control-track)] rounded-lg appearance-none cursor-pointer accent-[var(--app-accent)]"
                  />
                  <div className="flex justify-between text-[8px] text-[var(--app-text-muted)] mt-1 px-1">
                    <span>0°</span>
                    <span>90°</span>
                    <span>180°</span>
                    <span>270°</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <label className="text-[10px] text-[var(--app-text-secondary)]">{t('sidebar.gradientStartPos')}</label>
                      <span className="text-[10px] text-[var(--app-text-muted)]">{globalSettings.customGradient?.stop1 ?? 0}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="1"
                      value={globalSettings.customGradient?.stop1 ?? 0}
                      onChange={(e) => setGlobalSettings(s => ({ ...s, customGradient: { ...(s.customGradient || { color1: '#FFFFFF', color2: '#9CA3AF', angle: 180, stop1: 0, stop2: 100 }), stop1: parseInt(e.target.value) } }))}
                      className="w-full h-1 bg-[var(--app-control-track)] rounded-lg appearance-none cursor-pointer accent-[var(--app-accent)]"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <label className="text-[10px] text-[var(--app-text-secondary)]">{t('sidebar.gradientEndPos')}</label>
                      <span className="text-[10px] text-[var(--app-text-muted)]">{globalSettings.customGradient?.stop2 ?? 100}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" step="1"
                      value={globalSettings.customGradient?.stop2 ?? 100}
                      onChange={(e) => setGlobalSettings(s => ({ ...s, customGradient: { ...(s.customGradient || { color1: '#FFFFFF', color2: '#9CA3AF', angle: 180, stop1: 0, stop2: 100 }), stop2: parseInt(e.target.value) } }))}
                      className="w-full h-1 bg-[var(--app-control-track)] rounded-lg appearance-none cursor-pointer accent-[var(--app-accent)]"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mb-3">
              <p className="text-[10px] text-[var(--app-text-secondary)] mb-2">{t('sidebar.builtinBackgrounds')}</p>
              <div className="grid grid-cols-3 gap-2">
                {BUILTIN_BACKGROUNDS.map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => setGlobalSettings(s => ({ ...s, backgroundType: 'builtin', backgroundUpload: bg.src }))}
                    className={`w-full h-12 rounded-md transition-all overflow-hidden ${globalSettings.backgroundUpload === bg.src && globalSettings.backgroundType === 'builtin' ? 'ring-2 ring-blue-500 scale-105' : 'opacity-70 hover:opacity-100'}`}
                    title={getBuiltinBackgroundName(bg.id, bg.name)}
                  >
                    <img src={bg.src} alt={getBuiltinBackgroundName(bg.id, bg.name)} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {uploadedBackgrounds.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] text-[var(--app-text-secondary)] mb-2">{t('sidebar.linkedBackgrounds')}</p>
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
                      {isDeleteMode && (
                        <div
                          onClick={(e) => deleteUploadedBackground(idx, e)}
                          className="absolute inset-0 bg-red-500/20 flex items-center justify-center cursor-pointer z-20"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  {uploadedBackgrounds.length > 10 && (
                    <div className="w-full h-8 rounded-md bg-[var(--app-card-bg)] flex items-center justify-center text-[10px] text-[var(--app-text-secondary)]">
                      +{uploadedBackgrounds.length - 10}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleDirectoryBgUpload}
                className={`flex-1 flex items-center justify-center p-2 text-xs bg-[var(--app-input-bg)] rounded cursor-pointer hover:bg-[var(--app-border-hover)] border border-[var(--app-border)] transition ${globalSettings.backgroundType === 'upload' ? 'border-[var(--app-accent)] text-[var(--app-accent)] bg-[var(--app-accent-light)]' : 'text-[var(--app-text-secondary)]'}`}
              >
                <FolderInput className="w-3 h-3 mr-2" /> {t('sidebar.linkBackgroundFolder')}
              </button>
              {uploadedBackgrounds.length > 0 && (
                <button
                  onClick={() => setIsDeleteMode(!isDeleteMode)}
                  className={`flex items-center justify-center w-8 p-2 text-xs rounded cursor-pointer border transition ${isDeleteMode ? 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30' : 'bg-[var(--app-input-bg)] border-[var(--app-border)] text-[var(--app-text-secondary)] hover:text-red-400 hover:border-red-500/50'}`}
                  title={isDeleteMode ? t('common.done') : t('common.delete')}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            {backgroundFolderPath && (
              <p className="text-[9px] text-[var(--app-text-muted)] mt-1 text-center font-mono truncate" title={backgroundFolderPath}>
                {backgroundFolderPath.split('/').slice(-2).join('/')}
              </p>
            )}
          </>
        )}

        {bgExpanded && (globalSettings.backgroundType === 'upload' || globalSettings.backgroundType === 'builtin') && (
          <div className="mt-3 pt-3 border-t border-[var(--app-border)] space-y-3 element-subpanel">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-[var(--app-text-secondary)] font-bold tracking-[0.02em]">{t('sidebar.bgTransform')}</span>
            </div>

            <div className="space-y-3 p-3 bg-[var(--app-card-bg-solid)] rounded-lg border border-[var(--app-border)]">
              <div className="group">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] text-[var(--app-text-secondary)]">{t('layout.scale')}</label>
                  <span className="text-[10px] text-[var(--app-text-muted)] font-mono">{(globalSettings.backgroundScale || 1).toFixed(2)}x</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range" min="0.5" max="3" step="0.05"
                    value={globalSettings.backgroundScale || 1}
                    onChange={(e) => setGlobalSettings(s => ({ ...s, backgroundScale: parseFloat(e.target.value) }))}
                    className="flex-1 app-slider"
                  />
                  <button onClick={() => setGlobalSettings(s => ({ ...s, backgroundScale: 1.0 }))} className="p-1 text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)] opacity-0 group-hover:opacity-100 transition" title={t('common.reset')}>
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 group">
                  <label className="text-[10px] text-[var(--app-text-secondary)]">{t('layout.horizontalPosition')}</label>
                  <input
                    type="number"
                    value={globalSettings.backgroundX || 0}
                    onChange={(e) => setGlobalSettings(s => ({ ...s, backgroundX: parseInt(e.target.value) || 0 }))}
                    className="hidden"
                  />
                  <span className="text-[10px] text-[var(--app-text-muted)] font-mono">{globalSettings.backgroundX || 0}</span>
                </div>
                <div className="flex items-center gap-2 group">
                  <input
                    type="range" min="-1500" max="1500" step="10"
                    value={globalSettings.backgroundX || 0}
                    onChange={(e) => setGlobalSettings(s => ({ ...s, backgroundX: parseInt(e.target.value) || 0 }))}
                    className="flex-1 app-slider"
                  />
                  <button onClick={() => setGlobalSettings(s => ({ ...s, backgroundX: 0 }))} className="p-1 text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)] opacity-0 group-hover:opacity-100 transition" title={t('common.reset')}>
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 group">
                  <label className="text-[10px] text-[var(--app-text-secondary)]">{t('layout.verticalPosition')}</label>
                  <input
                    type="number"
                    value={globalSettings.backgroundY || 0}
                    onChange={(e) => setGlobalSettings(s => ({ ...s, backgroundY: parseInt(e.target.value) || 0 }))}
                    className="hidden"
                  />
                  <span className="text-[10px] text-[var(--app-text-muted)] font-mono">{globalSettings.backgroundY || 0}</span>
                </div>
                <div className="flex items-center gap-2 group">
                  <input
                    type="range" min="-1500" max="1500" step="10"
                    value={globalSettings.backgroundY || 0}
                    onChange={(e) => setGlobalSettings(s => ({ ...s, backgroundY: parseInt(e.target.value) || 0 }))}
                    className="flex-1 app-slider"
                  />
                  <button onClick={() => setGlobalSettings(s => ({ ...s, backgroundY: 0 }))} className="p-1 text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)] opacity-0 group-hover:opacity-100 transition" title={t('common.reset')}>
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const importProgressPercent = importProgress.total > 0
    ? (importProgress.status === 'queued'
      ? 10
      : importProgress.status === 'running'
        ? Math.min(100, Math.round((importProgress.current / importProgress.total) * 100))
        : Math.min(100, Math.round(((importProgress.current || importProgress.total) / importProgress.total) * 100)))
    : (importProgress.status === 'running' || importProgress.status === 'queued' ? 10 : 100);

  const importProgressBarClass = importProgress.status === 'error'
    ? 'bg-red-500'
    : importProgress.status === 'warning'
      ? 'bg-amber-500'
      : importProgress.status === 'success'
        ? 'bg-green-500'
        : 'bg-[var(--app-accent)]';

  return (
    <div className="flex flex-col h-screen font-sans overflow-hidden no-scrollbar app-container">

      {/* GLOBAL TOP TITLE BAR */}
      <div
        className="global-titlebar h-14 flex items-center justify-between px-5 shrink-0 drag-region bg-[var(--titlebar-bg)] border-b border-[var(--app-border)]"
        onMouseDown={(event) => handleTopbarBlankInteraction(event)}
      >
        {/* Left section with mode switcher and platform dropdown */}
        <div
          className="topbar-group no-drag"
          style={{ marginLeft: '70px' }}
          onMouseDown={(event) => handleTopbarBlankInteraction(event)}
        >

          {/* Platform Preset Dropdown - only show in screenshot mode */}
          {appMode === 'screenshot' && (
            <div className="relative" ref={platformDropdownRef}>
              <button
                onClick={() => setPlatformDropdownOpen(!platformDropdownOpen)}
                className="topbar-pill topbar-pill-wide cursor-pointer"
                title={t('rightPanel.sizePreset')}
              >
                <Monitor className="w-4 h-4 text-[var(--app-accent)]" />
                <span className="truncate flex-1 text-left">{getCurrentPlatformName()}</span>
                {platformDropdownOpen ? <ChevronUp className="w-3.5 h-3.5 text-[var(--app-text-muted)]" /> : <ChevronDown className="w-3.5 h-3.5 text-[var(--app-text-muted)]" />}
              </button>

              {platformDropdownOpen && (
                <div
                  className="topbar-panel absolute top-full left-0 mt-2 w-72 z-50 p-2 overflow-hidden max-h-80 overflow-y-auto slim-scrollbar"
                  onMouseDown={(event) => handleTopbarBlankInteraction(event, () => setPlatformDropdownOpen(false))}
                >
                  {['Apple', 'Google Play', 'Windows', 'Steam'].map(category => (
                    <div key={category}>
                      <div className="topbar-menu-category">{getPlatformCategoryName(category)}</div>
                      {PLATFORM_PRESETS.filter(p => p.category === category).map(preset => {
                        const isRequired = ['iphone-6.9', 'iphone-5.5', 'ipad-13'].includes(preset.id);
                        return (
                          <button
                            key={preset.id}
                            onClick={() => handlePlatformChange(preset)}
                            className={`topbar-menu-item cursor-pointer ${selectedPlatform === preset.id ? 'is-active' : ''}`}
                          >
                            <div className="topbar-menu-item-left">
                              <span>{getPresetName(preset.id, preset.name)}</span>
                              {isRequired && (
                                <span className="topbar-badge topbar-badge-accent">
                                  {t('common.required')}
                                </span>
                              )}
                            </div>
                            <span className="topbar-menu-item-meta font-mono">{preset.width}×{preset.height}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                  {customSizePresets.length > 0 && (
                    <div>
                      <div className="topbar-menu-category">{t('categories.custom')}</div>
                      {customSizePresets.map(preset => (
                        <div key={preset.id} className="flex items-center group">
                          <button
                            onClick={() => handlePlatformChange(preset)}
                            className={`topbar-menu-item flex-1 cursor-pointer ${selectedPlatform === preset.id ? 'is-active' : ''}`}
                          >
                            <span>{preset.name}</span>
                            <span className="topbar-menu-item-meta font-mono">{preset.width}×{preset.height}</span>
                          </button>
                          <button
                            onClick={() => deleteCustomSizePreset(preset.id)}
                            className="topbar-danger-icon opacity-0 group-hover:opacity-100 mr-1"
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
            <div className="relative topbar-pill topbar-size-shell text-xs">
              <span className="text-[var(--app-text-secondary)] font-mono">{t('common.widthShort')}</span>
              <input type="number" className="topbar-inline-input"
                value={globalSettings.width} onChange={(e) => setGlobalSettings(s => ({ ...s, width: parseInt(e.target.value) || 100 }))}
              />
              <span className="text-[var(--app-text-muted)]">×</span>
              <span className="text-[var(--app-text-secondary)] font-mono">{t('common.heightShort')}</span>
              <input type="number" className="topbar-inline-input"
                value={globalSettings.height} onChange={(e) => setGlobalSettings(s => ({ ...s, height: parseInt(e.target.value) || 100 }))}
              />
              <div className="topbar-divider"></div>
              <button
                onClick={() => setShowSavePresetModal(!showSavePresetModal)}
                className="topbar-mini-icon"
                title={t('common.saveAsPreset')}
              >
                <Save className="w-3.5 h-3.5" />
              </button>

              {/* Save Preset Dropdown */}
              {showSavePresetModal && (
                <div
                  className="topbar-panel absolute top-full left-0 mt-2 p-3 w-60 z-50"
                  ref={savePresetModalRef}
                  onMouseDown={(event) => handleTopbarBlankInteraction(event, () => setShowSavePresetModal(false))}
                >
                  <div className="text-xs text-[var(--app-text-muted)] mb-2">{globalSettings.width}×{globalSettings.height}</div>
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder={t('rightPanel.newPresetName')}
                    className="topbar-text-input mb-2"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveCustomSizePreset()}
                  />
                  <div className="topbar-action-row">
                    <button
                      onClick={() => setShowSavePresetModal(false)}
                      className="topbar-action"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={saveCustomSizePreset}
                      className="topbar-action topbar-action-primary"
                    >
                      {t('common.save')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div> {/* Close Left Section */}

        {/* Center section with language toggle - only show in screenshot mode */}
        {appMode === 'screenshot' && (
          <div className="topbar-group no-drag" onMouseDown={(event) => handleTopbarBlankInteraction(event)}>
            <div className="relative" ref={primaryLanguageMenuRef}>
              <button
                onClick={() => {
                  setPrimaryLanguageMenuOpen(!primaryLanguageMenuOpen);
                  setTranslationLanguageMenuOpen(false);
                }}
                className="topbar-pill topbar-pill-wide"
                title={t('scenes.primaryLanguage')}
              >
                <span className="text-[12px] leading-none">{primaryLanguageInfo?.flag}</span>
                <span className="truncate flex-1 text-left">{primaryLanguageInfo?.nativeName || globalSettings.primaryLang}</span>
                {primaryLanguageMenuOpen ? <ChevronUp className="w-3.5 h-3.5 text-[var(--app-text-muted)]" /> : <ChevronDown className="w-3.5 h-3.5 text-[var(--app-text-muted)]" />}
              </button>

              {primaryLanguageMenuOpen && (
                <div
                  className="topbar-panel absolute top-full left-0 mt-2 w-64 z-50 p-2"
                  onMouseDown={(event) => handleTopbarBlankInteraction(event, () => setPrimaryLanguageMenuOpen(false))}
                >
                  <button
                    onClick={applySystemLanguage}
                    className="topbar-action topbar-action-primary w-full mb-2 flex items-center justify-center gap-1.5"
                  >
                    <Monitor className="w-3.5 h-3.5" /> {t('scenes.followSystem')}
                  </button>

                  <div className="topbar-menu-list max-h-64 overflow-y-auto slim-scrollbar space-y-1">
                    {LANGUAGES.filter(lang => lang.code !== 'none').map(lang => {
                      const isActive = globalSettings.primaryLang === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => applyPrimaryLanguage(lang.code)}
                          className={`topbar-menu-item ${isActive ? 'is-active' : ''}`}
                        >
                          <span className="topbar-menu-item-left">
                            <span className="text-[12px] leading-none">{lang.flag}</span>
                            <span className="truncate">{lang.nativeName}</span>
                          </span>
                          {isActive && <span className="text-[10px] text-[var(--app-accent)]">{t('common.current')}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center w-6 text-[var(--app-text-muted)]/80">
              <ArrowRight className="w-4 h-4" />
            </div>

            <div className="relative" ref={translationLanguageMenuRef}>
              <button
                onClick={() => {
                  setTranslationLanguageMenuOpen(!translationLanguageMenuOpen);
                  setPrimaryLanguageMenuOpen(false);
                }}
                className="topbar-pill topbar-pill-wide"
                title={t('scenes.translationLanguage')}
              >
                <span className="text-[12px] leading-none">{hasTranslationLanguages ? (translationLanguageSummaryInfo?.flag || '🌐') : '∅'}</span>
                <span className="truncate flex-1 text-left">{hasTranslationLanguages ? (translationLanguageSummaryInfo?.nativeName || translationLanguageSummaryCode) : t('common.none')}</span>
                {hasTranslationLanguages && (
                  <span className="topbar-badge topbar-badge-accent">
                    {selectedSecondaryLangs.length}
                  </span>
                )}
                {translationLanguageMenuOpen ? <ChevronUp className="w-3.5 h-3.5 text-[var(--app-text-muted)]" /> : <ChevronDown className="w-3.5 h-3.5 text-[var(--app-text-muted)]" />}
              </button>

              {translationLanguageMenuOpen && (
                <div
                  className="topbar-panel absolute top-full left-0 mt-2 w-[22rem] z-50 p-3"
                  onMouseDown={(event) => handleTopbarBlankInteraction(event, () => setTranslationLanguageMenuOpen(false))}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="topbar-panel-title">
                        {t('scenes.translationLanguage')}
                      </div>
                      <span className="topbar-panel-caption">
                        {selectedSecondaryLangs.length > 0 ? t('common.selectedCount', { n: selectedSecondaryLangs.length }) : t('common.none')}
                      </span>
                    </div>

                    <div
                      className="topbar-menu-list max-h-48 overflow-y-auto slim-scrollbar space-y-1"
                      onMouseDown={(event) => handleTopbarBlankInteraction(event, () => setTranslationLanguageMenuOpen(false))}
                    >
                      {LANGUAGES.filter(lang => lang.code !== 'none' && lang.code !== globalSettings.primaryLang).map(lang => (
                        <label
                          key={lang.code}
                          className="topbar-menu-item"
                        >
                          <span className="topbar-menu-item-left">
                            <input
                              type="checkbox"
                              checked={selectedSecondaryLangs.includes(lang.code)}
                              onChange={() => toggleSecondaryLanguage(lang.code)}
                              className="rounded bg-[var(--app-input-bg)] border-[var(--app-border)] text-[var(--app-accent)]"
                            />
                            <span className="text-[12px] leading-none">{lang.flag}</span>
                            <span className="truncate">{lang.nativeName}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right section with export button - always show */}
        <div className="topbar-group no-drag" onMouseDown={(event) => handleTopbarBlankInteraction(event)}>
          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => {
                if (appMode === 'icon') {
                  // 图标模式直接触发导出
                  window.dispatchEvent(new CustomEvent('trigger-icon-export'));
                } else {
                  // 海报模式显示下拉菜单
                  setExportMenuOpen(!exportMenuOpen);
                }
              }}
              className="topbar-pill topbar-pill-primary"
            >
              <Download className="w-3.5 h-3.5" />
              {appMode === 'icon' ? t('header.exportIcon') : t('header.exportAll')}
              {appMode !== 'icon' && <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {exportMenuOpen && appMode !== 'icon' && (
              <div
                className="topbar-panel absolute top-full right-0 mt-2 w-64 z-50 p-2 overflow-hidden space-y-1"
                onMouseDown={(event) => handleTopbarBlankInteraction(event, () => setExportMenuOpen(false))}
              >
                <button
                  onClick={() => { handleExportAll(); setExportMenuOpen(false); }}
                  className="topbar-menu-item"
                >
                  <div className="topbar-menu-item-left">
                    <Globe className="w-4 h-4 text-[var(--app-accent)]" />
                    <div className="text-left">
                      <div className="font-medium">{t('export.byLanguage')}</div>
                      <div className="topbar-menu-item-meta">{t('export.byLanguageDesc')}</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => { handleExportByDevice(); setExportMenuOpen(false); }}
                  className="topbar-menu-item"
                >
                  <div className="topbar-menu-item-left">
                    <Smartphone className="w-4 h-4 text-green-400" />
                    <div className="text-left">
                      <div className="font-medium">{t('export.byDevice')}</div>
                      <div className="topbar-menu-item-meta">{t('export.byDeviceDesc')}</div>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* SETTINGS BUTTON */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="topbar-pill topbar-pill-icon"
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

      <ExportProgressModal
        isOpen={exportProgress.active}
        progress={exportProgress}
        onCancel={handleCancelExport}
        onClose={closeExportModal}
      />

      {/* MAIN CONTENT AREA - Conditional rendering based on mode */}
      {
        appMode === 'icon' ? (
          <IconFabric />
        ) : (
          <div className="flex flex-1 overflow-hidden">

            {/* LEFT SIDEBAR - Scrollable Container */}
            <div className="w-80 border-r border-[var(--app-border)] bg-[var(--app-bg-sidebar)] flex flex-col flex-shrink-0 z-20 shadow-xl sidebar-panel overflow-y-auto no-scrollbar">

              {/* Ollama Settings */}
              <div className="px-4 py-3 border-b border-[var(--app-border)] bg-[var(--app-bg-panel-header)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--app-text-secondary)] tracking-[0.02em]">
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
                    <input className="w-full text-xs bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded p-1 text-[var(--app-text-primary)]"
                      value={ollamaConfig.host} onChange={(e) => setOllamaConfig(s => ({ ...s, host: e.target.value }))}
                      placeholder="http://localhost:11434"
                    />
                    <button onClick={async () => {
                      const connection = await checkOllamaConnection();
                      if (!connection.ok) {
                        setShowOllamaGuide(true);
                      } else {
                        setShowOllamaGuide(false);
                      }
                    }}
                      className="w-full text-xs bg-[var(--app-accent-light)] hover:bg-[var(--app-accent)] hover:text-white text-[var(--app-accent)] py-1.5 rounded border border-[var(--app-accent)]/30 transition flex items-center justify-center gap-1">
                      {t('ollama.connect')}
                    </button>

                    {/* Installation Guide - Shows when connection fails or user requests help */}
                    {showOllamaGuide && (
                      <div className="mt-2 p-3 bg-[var(--app-card-bg)] rounded-lg border border-[var(--app-border)] text-xs text-[var(--app-text-secondary)] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-start gap-2 mb-2 text-[var(--app-warning)]">
                          <Monitor className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p className="leading-relaxed">
                            <span className="font-semibold text-[var(--app-warning)]">{t('ollama.recommended')}</span>
                            {t('ollama.recommendedDesc')}
                          </p>
                        </div>

                        <div className="space-y-2 pl-1">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-[var(--app-bg-elevated)] flex items-center justify-center text-[10px] font-bold text-[var(--app-text-secondary)]">1</div>
                            <a href="https://ollama.com/download" target="_blank" rel="noreferrer"
                              className="text-[var(--app-accent)] hover:text-[var(--app-accent-hover)] underline underline-offset-2">
                              {t('ollama.downloadInstall')}
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-[var(--app-bg-elevated)] flex items-center justify-center text-[10px] font-bold text-[var(--app-text-secondary)]">2</div>
                            <span className="text-[var(--app-text-secondary)]">{t('ollama.runApp')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-[var(--app-bg-elevated)] flex items-center justify-center text-[10px] font-bold text-[var(--app-text-secondary)]">3</div>
                            <span className="text-[var(--app-text-secondary)]">{t('ollama.clickConnect')}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select className="w-full text-xs bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded p-1 text-[var(--app-text-primary)]" value={ollamaConfig.model}
                      onChange={(e) => setOllamaConfig(s => ({ ...s, model: e.target.value }))}
                    >
                      {ollamaConfig.availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <input type="checkbox" id="autoTrans" checked={ollamaConfig.autoTranslate} onChange={(e) => setOllamaConfig(s => ({ ...s, autoTranslate: e.target.checked }))}
                        />
                        <label htmlFor="autoTrans" className="text-xs text-[var(--app-text-secondary)]">{t('ollama.autoTranslateFilename')}</label>
                      </div>
                      <button
                        type="button"
                        onClick={handleBatchRetranslate}
                        disabled={isBatchRetranslating || batchTranslationTargetCount === 0 || selectedSecondaryLangs.length === 0}
                        className={`shrink-0 text-[10px] flex items-center gap-1 px-2 py-1 rounded transition ${!isBatchRetranslating && batchTranslationTargetCount > 0 && selectedSecondaryLangs.length > 0 ? 'bg-[var(--app-accent)] text-white hover:bg-[var(--app-accent-hover)]' : 'bg-[var(--app-bg-elevated)] text-[var(--app-text-muted)] cursor-not-allowed'}`}
                        title={batchTranslationJobCount > 0 ? t('alerts.batchTranslateSummary', { sceneCount: batchTranslationTargetCount, taskCount: batchTranslationJobCount }) : (selectedSecondaryLangs.length === 0 ? t('alerts.batchTranslateMissingTarget', '未设置翻译语言，无法执行批量翻译') : t('alerts.batchTranslateNoScenes', '没有可批量翻译的截图'))}
                      >
                        <RefreshCw className={`w-3 h-3 ${isBatchRetranslating ? 'animate-spin' : ''}`} />
                        {t('ollama.batchTranslateAll', '批量翻译')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Scene List - Flow within parent scroll */}
              <div className="p-4 sidebar-panel">
                <div className="px-4 py-3 border-b border-[var(--app-border)] bg-[var(--app-bg-panel-header)] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {/* Select All Checkbox - Only in Selection Mode */}
                    {isSelectionMode && (
                      <input
                        type="checkbox"
                        checked={selectedSceneIds.size === scenes.filter(s => s.screenshot).length && scenes.filter(s => s.screenshot).length > 0}
                        onChange={toggleSelectAll}
                        className="rounded bg-[var(--app-input-bg)] border-[var(--app-border)] text-[var(--app-accent)] cursor-pointer"
                        title={t('scenes.selectAll')}
                      />
                    )}
                    <h2 className="text-xs font-semibold text-[var(--app-text-secondary)] tracking-[0.02em] truncate">
                      {t('scenes.sceneList')} ({scenes.filter(s => s.screenshot).length})
                    </h2>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Selection Mode Toggle */}
                    <button
                      onClick={() => {
                        setIsSelectionMode(!isSelectionMode);
                        if (isSelectionMode) setSelectedSceneIds(new Set()); // Clear selection when exiting mode
                      }}
                      className={`p-1.5 rounded transition ${isSelectionMode ? 'bg-[var(--app-accent)] text-white' : 'text-[var(--app-text-secondary)] hover:bg-[var(--app-bg-elevated)] hover:text-[var(--app-text-primary)]'}`}
                      title={isSelectionMode ? t('common.cancel') : t('scenes.selectAll')} // Reusing translations broadly
                    >
                      <CheckSquare className="w-4 h-4" />
                    </button>

                    {/* Delete Selected (Only in Selection Mode) */}
                    {isSelectionMode && selectedSceneIds.size > 0 && (
                      <button
                        onClick={deleteSelectedScenes}
                        className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded transition"
                        title={t('scenes.deleteSelected').replace('{n}', selectedSceneIds.size)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="relative">
                      <button
                        type="button"
                        className="p-1.5 text-[var(--app-accent)] hover:text-white hover:bg-[var(--app-accent)] rounded transition"
                        title={t('scenes.importScreenshots')}
                      >
                        <FolderInput className="w-4 h-4" />
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleBatchUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label={t('scenes.importScreenshots')}
                        title={t('scenes.importScreenshots')}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pb-20">
                  {/* 只显示有截图的场景，隐藏空截图占位 */}
                  {scenes.filter(scene => scene.screenshot).map(scene => (
                    <div key={scene.id} onClick={() => setActiveSceneId(scene.id)}
                      className={`group p-2 rounded-lg cursor-pointer flex items-center gap-3 border transition-all ${selectedSceneIds.has(scene.id) ? 'bg-[var(--app-accent-light)] border-[var(--app-accent)]' : activeSceneId === scene.id ? 'bg-[var(--app-card-bg-solid)] border-[var(--app-accent)] shadow-lg' : 'bg-[var(--app-card-bg)] border-[var(--app-border)] hover:bg-[var(--app-card-bg-hover)]'}`}
                    >
                      {/* 多选 Checkbox - Conditional */}
                      {isSelectionMode && (
                        <input
                          type="checkbox"
                          checked={selectedSceneIds.has(scene.id)}
                          onChange={(e) => toggleSceneSelection(scene.id, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded bg-[var(--app-input-bg)] border-[var(--app-border)] text-[var(--app-accent)] cursor-pointer flex-shrink-0"
                        />
                      )}
                      <div className="w-8 h-12 bg-[var(--app-bg-elevated)] rounded overflow-hidden flex-shrink-0 border border-[var(--app-border)] relative">
                        <img src={scene.screenshot} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${activeSceneId === scene.id ? 'text-[var(--app-text-primary)]' : 'text-[var(--app-text-secondary)]'}`}>{scene.name || t('scenes.unnamed')}</div>
                        <div className="text-[10px] text-[var(--app-text-muted)] truncate">{getSceneTitleByLanguage(scene, sceneListPreviewLanguage) || '...'}</div>
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
                    <div className="text-center py-8 text-[var(--app-text-muted)] text-xs">
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
              <div className="flex-1 overflow-hidden p-4 flex items-center justify-center relative" style={{ background: 'var(--app-bg-canvas-gradient)' }}>
                {/* Design Tips - 悬浮在预览区上方 */}
                {(() => {
                  const currentPreset = [...PLATFORM_PRESETS, ...customSizePresets].find(p => p.id === selectedPlatform);
                  if (currentPreset?.designTips?.length > 0) {
                    return (
                      <div className="absolute top-4 left-4 z-10">
                        <DesignTips tips={translateDesignTips(currentPreset.designTips)} mode={currentPreset.mode || 'poster'} />
                      </div>
                    );
                  }
                  return null;
                })()}
                {/* Canvas Container - Auto-fit */}
                <div
                  className="relative shadow-2xl ring-1 ring-[var(--app-border)] rounded-lg overflow-hidden"
                  onClick={handleCanvasClick}
                  onPointerDown={handleCanvasPointerDown}
                  style={{
                    aspectRatio: `${globalSettings.width}/${globalSettings.height}`,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto'
                  }}
                >
                  <canvas ref={canvasRef} className="w-full h-full object-contain bg-[var(--app-bg-secondary)] block" />
                  {selectedOverlayBounds && (
                    <div
                      className={`absolute canvas-selection-shell pointer-events-none ${selectedElement === 'background' ? 'canvas-selection-shell-background' : ''}`}
                      style={getOverlayStyle(selectedOverlayBounds)}
                    >
                      <div
                        className={`absolute inset-0 canvas-selection-outline ${selectedElement === 'background' ? 'canvas-selection-outline-background pointer-events-none' : 'pointer-events-auto cursor-move'}`}
                        onPointerDown={selectedElement === 'background' ? undefined : handleSelectionOverlayPointerDown}
                      />
                      {(selectedElement === 'text' || selectedElement === 'screenshot' || selectedElement === 'device') && (
                        <>
                          <button
                            type="button"
                            className="absolute canvas-selection-handle canvas-selection-handle-n pointer-events-auto"
                            onPointerDown={handleSelectionResizePointerDown}
                            aria-label={t('layout.scale')}
                            title={t('layout.scale')}
                          />
                          <button
                            type="button"
                            className="absolute top-0 left-0 canvas-selection-handle canvas-selection-handle-nw pointer-events-auto"
                            onPointerDown={handleSelectionResizePointerDown}
                            aria-label={t('layout.scale')}
                            title={t('layout.scale')}
                          />
                          <button
                            type="button"
                            className="absolute top-0 right-0 canvas-selection-handle canvas-selection-handle-ne pointer-events-auto"
                            onPointerDown={handleSelectionResizePointerDown}
                            aria-label={t('layout.scale')}
                            title={t('layout.scale')}
                          />
                          <button
                            type="button"
                            className="absolute canvas-selection-handle canvas-selection-handle-e pointer-events-auto"
                            onPointerDown={handleSelectionResizePointerDown}
                            aria-label={t('layout.scale')}
                            title={t('layout.scale')}
                          />
                          <button
                            type="button"
                            className="absolute canvas-selection-handle canvas-selection-handle-s pointer-events-auto"
                            onPointerDown={handleSelectionResizePointerDown}
                            aria-label={t('layout.scale')}
                            title={t('layout.scale')}
                          />
                          <button
                            type="button"
                            className="absolute bottom-0 left-0 canvas-selection-handle canvas-selection-handle-sw pointer-events-auto"
                            onPointerDown={handleSelectionResizePointerDown}
                            aria-label={t('layout.scale')}
                            title={t('layout.scale')}
                          />
                          <button
                            type="button"
                            className="absolute bottom-0 right-0 canvas-selection-handle canvas-selection-handle-se pointer-events-auto"
                            onPointerDown={handleSelectionResizePointerDown}
                            aria-label={t('layout.scale')}
                            title={t('layout.scale')}
                          />
                          <button
                            type="button"
                            className="absolute canvas-selection-handle canvas-selection-handle-w pointer-events-auto"
                            onPointerDown={handleSelectionResizePointerDown}
                            aria-label={t('layout.scale')}
                            title={t('layout.scale')}
                          />
                        </>
                      )}
                    </div>
                  )}
                  {alignmentGuides.vertical && (
                    <div className="absolute canvas-alignment-guide canvas-alignment-guide-vertical" style={{ left: '50%' }} />
                  )}
                  {alignmentGuides.horizontal && (
                    <div className="absolute canvas-alignment-guide canvas-alignment-guide-horizontal" style={{ top: '50%' }} />
                  )}
                  {floatingPreviewBounds && (
                    <div
                      className="absolute canvas-drag-preview pointer-events-none"
                      style={getOverlayStyle(floatingPreviewBounds)}
                    />
                  )}
                  {/* Overlay Info */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[9px] text-gray-400 pointer-events-none">
                    {globalSettings.width} × {globalSettings.height}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR - Edit Active Scene */}
            <div className="w-72 border-l border-[var(--app-border)] bg-[var(--app-bg-sidebar)] flex flex-col flex-shrink-0 shadow-xl z-20 no-scrollbar overflow-y-auto sidebar-panel">

              {/* 1. Header & Layout Presets (Global Params) */}
              <div className="p-5 border-b border-[var(--app-border)]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-bold text-[var(--app-text-primary)]">{t('rightPanel.paramAdjust')}</h2>
                  <button onClick={applySettingsToAll} title={t('rightPanel.applyToAllHint')}
                    className="text-xs flex items-center gap-1 text-[var(--app-accent)] hover:text-[var(--app-accent-hover)] bg-[var(--app-accent-light)] hover:bg-[var(--app-accent)]/20 px-2 py-1 rounded transition border border-[var(--app-accent)]/30">
                    <Copy className="w-3 h-3" /> {t('rightPanel.applyToAll')}
                  </button>
                </div>

                {/* Saved Configs */}
                <div className="bg-[var(--app-card-bg)] rounded-lg p-3 border border-[var(--app-border)]">
                  <label className="text-[10px] text-gray-500 font-semibold tracking-[0.02em] mb-2 block flex items-center gap-2">
                    <Archive className="w-3 h-3" /> {t('rightPanel.layoutPresets')}
                  </label>
                  <div className="flex gap-1 mb-2">
                    <input
                      type="text"
                      value={configName}
                      onChange={(e) => setConfigName(e.target.value)}
                      placeholder={t('rightPanel.newPresetName')}
                      className="flex-1 min-w-0 bg-[var(--app-input-bg)] text-xs border border-[var(--app-border)] rounded px-2 py-1 text-[var(--app-text-primary)]"
                    />
                    <button onClick={saveConfig} className="p-1 bg-[var(--app-bg-elevated)] text-[var(--app-accent)] rounded border border-[var(--app-accent)]/30 hover:bg-[var(--app-bg-tertiary)]"><Save className="w-3 h-3" /></button>
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {savedConfigs.map((config, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-[var(--app-card-bg-solid)] p-1 rounded group">
                        <span onClick={() => loadConfig(config)} className="text-[var(--app-text-secondary)] cursor-pointer hover:text-[var(--app-text-primary)] flex-1 truncate">{config.name}</span>
                        <button onClick={() => deleteConfig(idx)} className="text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-b border-[var(--app-border)]">
                <div className="flex bg-[var(--app-input-bg)] rounded-xl p-1">
                  {elementTabs.map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleElementTabSelect(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[11px] font-medium transition ${activeElementTab === tab.id
                        ? 'bg-[var(--app-accent)] text-white shadow-sm'
                        : 'text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]'
                        }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
                {mockupEnabled && activeElementTab === 'screenshot' && (
                  <div className="mt-3 flex bg-[var(--app-card-bg)] rounded-xl p-1 border border-[var(--app-border)] element-subpanel">
                    <button
                      type="button"
                      onClick={() => setSelectedElement('screenshot')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[11px] font-medium transition ${selectedElement === 'screenshot'
                        ? 'bg-[var(--app-accent)] text-white shadow-sm'
                        : 'text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]'
                        }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      {t('layout.screenshotControls')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedElement('device')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[11px] font-medium transition ${selectedElement === 'device'
                        ? 'bg-[var(--app-accent)] text-white shadow-sm'
                        : 'text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]'
                        }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      {t('layout.deviceControls')}
                    </button>
                  </div>
                )}
              </div>

              {selectedElement === 'background' && renderBackgroundSettingsPanel()}

              {selectedElement === 'text' && (
              <div className="p-5 border-b border-[var(--app-border)] element-panel">
                <div className="bg-[var(--app-card-bg)] rounded-lg p-3 border border-[var(--app-border)]">
                  <h3 className="text-xs text-[var(--app-text-secondary)] font-bold tracking-[0.02em] mb-4 flex items-center gap-2">
                    <Type className="w-3 h-3" /> {t('text.title')}
                  </h3>

                  <div className="space-y-4">
                    <div className="pb-4 border-b border-[var(--app-border)]">
                      <div className="flex items-center justify-between mb-3 gap-3">
                        <span className="text-[10px] text-[var(--app-text-secondary)] font-semibold tracking-[0.02em]">
                          {t('scenes.previewLanguage', '画布语言')}
                        </span>
                        <span className="text-[10px] text-[var(--app-text-muted)] truncate">
                          {previewLanguageInfo?.nativeName || previewLanguage}
                        </span>
                      </div>
                      <div className="space-y-2 max-h-44 overflow-y-auto slim-scrollbar pr-1">
                        {previewLanguageOptions.map((languageCode, index) => {
                          const languageInfo = getLanguageInfo(languageCode);
                          const isActive = previewLanguage === languageCode;
                          const isPrimaryLanguage = index === 0;

                          return (
                            <button
                              key={`preview-language-${languageCode}`}
                              type="button"
                              onClick={() => setPreviewLanguage(languageCode)}
                              className={`w-full px-3 py-2 rounded-lg border text-left transition ${isActive
                                ? 'border-[var(--app-accent)] bg-[var(--app-accent-light)] text-[var(--app-accent)]'
                                : 'border-[var(--app-border)] bg-[var(--app-input-bg)] text-[var(--app-text-secondary)] hover:border-[var(--app-border-strong)] hover:text-[var(--app-text-primary)]'
                                }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[12px] leading-none">{languageInfo?.flag || '🌐'}</span>
                                  <span className="text-xs font-medium truncate">
                                    {languageInfo?.nativeName || languageCode}
                                  </span>
                                </div>
                                <span className="text-[10px] opacity-70 shrink-0">
                                  {isPrimaryLanguage
                                    ? t('scenes.primaryLanguage')
                                    : t('scenes.translationLanguage')}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Global Text Controls */}
                    <div className="pb-4 border-b border-[var(--app-border)]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] text-[var(--app-text-secondary)] font-semibold tracking-[0.02em]">{t('text.alignment')}</span>
                        <div className="flex bg-[var(--app-input-bg)] rounded-md p-0.5">
                          <button
                            onClick={() => setGlobalSettings(s => ({ ...s, textAlign: 'left' }))}
                            className={`p-1.5 rounded transition ${globalSettings.textAlign === 'left' ? 'bg-[var(--app-accent)] text-white' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]'}`}
                          >
                            <AlignLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setGlobalSettings(s => ({ ...s, textAlign: 'center' }))}
                            className={`p-1.5 rounded transition ${globalSettings.textAlign === 'center' ? 'bg-[var(--app-accent)] text-white' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]'}`}
                          >
                            <AlignCenter className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setGlobalSettings(s => ({ ...s, textAlign: 'right' }))}
                            className={`p-1.5 rounded transition ${globalSettings.textAlign === 'right' ? 'bg-[var(--app-accent)] text-white' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)]'}`}
                          >
                            <AlignRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {/* Text Effects */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--app-border)]">
                        <label className="flex items-center gap-2 text-[10px] text-[var(--app-text-secondary)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={globalSettings.textShadow}
                            onChange={(e) => setGlobalSettings(s => ({ ...s, textShadow: e.target.checked }))}
                            className="rounded bg-[var(--app-input-bg)] border-[var(--app-border)] text-[var(--app-accent)]"
                          />
                          {t('text.shadow')}
                        </label>
                        <label className="flex items-center gap-2 text-[10px] text-[var(--app-text-secondary)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={globalSettings.textStroke}
                            onChange={(e) => setGlobalSettings(s => ({ ...s, textStroke: e.target.checked }))}
                            className="rounded bg-[var(--app-input-bg)] border-[var(--app-border)] text-[var(--app-accent)]"
                          />
                          {t('text.stroke')}
                        </label>
                        <label className="flex items-center gap-2 text-[10px] text-[var(--app-text-secondary)] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={globalSettings.textOnTop}
                            onChange={(e) => setGlobalSettings(s => ({ ...s, textOnTop: e.target.checked }))}
                            className="rounded bg-[var(--app-input-bg)] border-[var(--app-border)] text-[var(--app-accent)]"
                          />
                          {t('text.textOnTop')}
                        </label>
                      </div>
                      {/* Stroke Color - only show when stroke is enabled */}
                      {globalSettings.textStroke && (
                        <div className="mt-2 space-y-2">
                          <div>
                            <div className="text-[10px] text-[var(--app-text-secondary)] mb-1">{t('text.strokeColor')}</div>
                            <div className="flex gap-1.5">
                              {STROKE_COLORS.map(c => (
                                <button
                                  key={c.id}
                                  onClick={() => setGlobalSettings(s => ({ ...s, strokeColor: c.id }))}
                                  className={`w-5 h-5 rounded-md border-2 transition ${globalSettings.strokeColor === c.id ? 'border-blue-500 scale-110' : 'border-gray-600 hover:border-gray-500'}`}
                                  style={{ background: c.value }}
                                  title={getStrokeColorName(c.id, c.name)}
                                />
                              ))}
                            </div>
                          </div>
                          {/* Stroke Width & Opacity */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="flex justify-between text-[10px] text-gray-400 mb-1">{t('text.strokeWidth')} <span>{globalSettings.strokeWidth || 4}</span></div>
                              <input
                                type="range" min="1" max="15" step="1"
                                value={globalSettings.strokeWidth || 4}
                                onChange={(e) => setGlobalSettings(s => ({ ...s, strokeWidth: parseInt(e.target.value) }))}
                                className="w-full h-1 bg-[var(--app-control-track)] rounded-lg accent-[var(--app-accent)]"
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] text-gray-400 mb-1">{t('text.strokeOpacity')} <span>{Math.round((globalSettings.strokeOpacity !== undefined ? globalSettings.strokeOpacity : 1) * 100)}%</span></div>
                              <input
                                type="range" min="0" max="1" step="0.1"
                                value={globalSettings.strokeOpacity !== undefined ? globalSettings.strokeOpacity : 1}
                                onChange={(e) => setGlobalSettings(s => ({ ...s, strokeOpacity: parseFloat(e.target.value) }))}
                                className="w-full h-1 bg-[var(--app-control-track)] rounded-lg accent-[var(--app-accent)]"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Text Fade Control */}
                      <div className="mt-3 pt-3 border-t border-[var(--app-border)] space-y-2">
                        <div className="text-[10px] text-[var(--app-text-secondary)] font-semibold tracking-[0.02em]">{t('text.gradientControl')}</div>
                        <div className="group">
                          <div className="flex justify-between text-[10px] text-[var(--app-text-secondary)] mb-1">{t('text.fadePosition')} <span>{Math.round(globalSettings.fadeStart * 100)}%</span></div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range" min="-1" max="1" step="0.05"
                              value={globalSettings.fadeStart}
                              onChange={(e) => setGlobalSettings(s => ({ ...s, fadeStart: parseFloat(e.target.value) }))}
                              className="flex-1 app-slider"
                            />
                            <button onClick={() => setGlobalSettings(s => ({ ...s, fadeStart: -0.3 }))} className="p-1 text-[var(--app-text-muted)] hover:text-[var(--app-accent)] opacity-0 group-hover:opacity-100 transition"><RotateCcw className="w-3 h-3" /></button>
                          </div>
                        </div>
                        <div className="group">
                          <div className="flex justify-between text-[10px] text-[var(--app-text-secondary)] mb-1">{t('text.bottomOpacity')} <span>{Math.round(globalSettings.fadeOpacity * 100)}%</span></div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range" min="0" max="1" step="0.05"
                              value={globalSettings.fadeOpacity}
                              onChange={(e) => setGlobalSettings(s => ({ ...s, fadeOpacity: parseFloat(e.target.value) }))}
                              className="flex-1 app-slider"
                            />
                            <button onClick={() => setGlobalSettings(s => ({ ...s, fadeOpacity: 0.75 }))} className="p-1 text-[var(--app-text-muted)] hover:text-[var(--app-accent)] opacity-0 group-hover:opacity-100 transition"><RotateCcw className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pb-4 border-b border-[var(--app-border)]">
                      <div className="relative">
                        <div className="mb-1 flex justify-between items-center gap-2">
                          <label
                            htmlFor={`scene-${activeScene.id}-title-${previewLanguage}`}
                            className="block text-[10px] text-[var(--app-text-secondary)]"
                          >
                            {previewLanguageInfo?.nativeName || previewLanguage} <span className="opacity-50">- {previewLanguageRoleLabel}</span>
                          </label>
                          {!previewLanguageIsPrimary && previewTranslationLanguage && (
                            <button
                              type="button"
                              onClick={() => handleRetranslateSceneLanguage(previewTranslationLanguage)}
                              disabled={!previewTranslationSourceText || isRetranslating}
                              className={`shrink-0 text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded transition ${previewTranslationSourceText && !isRetranslating ? 'bg-[var(--app-accent)] text-white hover:bg-[var(--app-accent-hover)]' : 'bg-[var(--app-bg-elevated)] text-[var(--app-text-muted)] cursor-not-allowed'}`}
                            >
                              <RefreshCw className={`w-3 h-3 ${isRetranslating ? 'animate-spin' : ''}`} /> {t('text.reTranslate')}
                            </button>
                          )}
                        </div>
                        <textarea
                          id={`scene-${activeScene.id}-title-${previewLanguage}`}
                          rows={2}
                          value={previewLanguageTitle}
                          onChange={(e) => {
                            const nextTitle = e.target.value;
                            const titleUpdate = buildSceneTitleUpdate(activeScene, previewLanguage, nextTitle);
                            updateScene(
                              activeScene.id,
                              previewLanguageIsPrimary
                                ? { ...titleUpdate, name: nextTitle.replace(/\n/g, ' ') }
                                : titleUpdate
                            );
                          }}
                          className="w-full bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded p-2 text-xs text-[var(--app-text-primary)] focus:border-[var(--app-accent)] outline-none resize-none transition"
                          placeholder={t('common.multilinePlaceholder')}
                        />
                      </div>
                    </div>

                    <div className="mt-2 text-[var(--app-text-secondary)]">
                      <h4 className="text-xs text-[var(--app-text-secondary)] font-bold tracking-[0.02em] mb-3">
                        {previewLanguageInfo?.nativeName || previewLanguage} {t('text.primaryStyle')}
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="text-[10px] text-[var(--app-text-secondary)] mb-1">{t('text.font')}</div>
                          <select
                            value={previewLanguageTextStyle.font}
                            onChange={(e) => updateGlobalLanguageStyle(previewLanguage, { font: e.target.value })}
                            className="w-full bg-[var(--app-input-bg)] border border-[var(--app-border)] rounded px-2 py-1 text-xs text-[var(--app-text-primary)]"
                          >
                            {getFontOptionsForLanguage(previewLanguage).map(font => (
                              <option key={font.id} value={font.value}>{getFontName(font.id, font.name)}</option>
                            ))}
                          </select>
                        </div>

                        {previewLanguage !== globalSettings.primaryLang && (
                          <div>
                            <label className="flex items-center gap-2 text-[10px] text-[var(--app-text-secondary)] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={previewLanguageTextStyle.uppercase}
                                onChange={(e) => updateGlobalLanguageStyle(previewLanguage, { uppercase: e.target.checked })}
                                className="rounded bg-[var(--app-input-bg)] border-[var(--app-border)] text-[var(--app-accent)]"
                              />
                              {t('text.uppercase')}
                            </label>
                          </div>
                        )}

                        <div>
                          <div className="text-[10px] text-[var(--app-text-secondary)] mb-1">{t('text.color')}</div>
                          <div className="flex gap-1.5 flex-wrap">
                            {TEXT_COLORS.map(c => (
                              <button
                                key={c.id}
                                onClick={() => updateGlobalLanguageStyle(previewLanguage, { textColor: c.id })}
                                className={`w-6 h-6 rounded-md border-2 transition ${previewLanguageTextStyle.textColor === c.id ? 'border-[var(--app-accent)] scale-110' : 'border-[var(--app-border-strong)] hover:border-[var(--app-accent)]'}`}
                                style={{ background: c.gradient ? `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})` : c.value }}
                                title={getTextColorName(c.id, c.name)}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="group">
                          <div className="flex justify-between text-[10px] text-[var(--app-text-secondary)] mb-1">{t('text.fontSize')} <span>{previewedTextStyle.textSize}</span></div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range" min="40" max="300" step="5"
                              value={previewedTextStyle.textSize}
                              onChange={(e) => queueDragPreview('text', { textSize: parseInt(e.target.value) })}
                              onPointerUp={() => commitDragPreview('text')}
                              onBlur={() => commitDragPreview('text')}
                              className="flex-1 h-1 bg-[var(--app-control-track)] rounded-lg appearance-none cursor-pointer accent-[var(--app-accent)]"
                            />
                            <button
                              onClick={() => {
                                clearDragPreview();
                                resetSceneLanguageStyle(activeScene.id, previewLanguage, 'textSize');
                              }}
                              className="p-1 text-[var(--app-text-muted)] hover:text-[var(--app-accent)] opacity-0 group-hover:opacity-100 transition"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="group">
                          <div className="flex justify-between text-[10px] text-[var(--app-text-secondary)] mb-1">{t('layout.verticalPosition')} <span>{previewedTextStyle.textY}</span></div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range" min="50" max="1000" step="10"
                              value={previewedTextStyle.textY}
                              onChange={(e) => queueDragPreview('text', { textY: parseInt(e.target.value) })}
                              onPointerUp={() => commitDragPreview('text')}
                              onBlur={() => commitDragPreview('text')}
                              className="flex-1 h-1 bg-[var(--app-control-track)] rounded-lg appearance-none cursor-pointer accent-[var(--app-accent)]"
                            />
                            <button
                              onClick={() => {
                                clearDragPreview();
                                resetSceneLanguageStyle(activeScene.id, previewLanguage, 'textY');
                              }}
                              className="p-1 text-[var(--app-text-muted)] hover:text-[var(--app-accent)] opacity-0 group-hover:opacity-100 transition"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* 3. Screenshot & Device Controls */}
              {(selectedElement === 'screenshot' || selectedElement === 'device') && (
              <div className="p-5 element-panel">
                <div className="space-y-4">
                  {/* Screenshot Controls */}
                  {selectedElement === 'screenshot' && (
                  <div className="bg-[var(--app-card-bg)] rounded-lg p-3 border border-[var(--app-border)]">
                    <label className="text-xs text-[var(--app-text-secondary)] font-bold tracking-[0.02em] mb-3 block flex items-center gap-2">
                      <Settings className="w-3 h-3" /> {t('layout.title')}
                    </label>
                    <div className="space-y-3">
                      <div className="group">
                        <div className="flex justify-between text-[10px] text-[var(--app-text-secondary)] mb-1">
                          {t('layout.scale')} <span>{Math.round(previewedSceneSettings.screenshotScale * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="range" min="0.3" max="3.0" step="0.01" value={previewedSceneSettings.screenshotScale}
                            onChange={(e) => queueDragPreview('screenshot', { screenshotScale: parseFloat(e.target.value) })}
                            onPointerUp={() => commitDragPreview('screenshot')}
                            onBlur={() => commitDragPreview('screenshot')}
                            className="flex-1 h-1 bg-[var(--app-control-track)] rounded-lg appearance-none cursor-pointer accent-[var(--app-accent)]"
                          />
                          <button onClick={() => { clearDragPreview(); resetSceneSetting('screenshotScale'); }} className="p-1 text-[var(--app-text-muted)] hover:text-[var(--app-accent)] opacity-0 group-hover:opacity-100 transition"><RotateCcw className="w-3 h-3" /></button>
                        </div>
                      </div>
                      <div className="group">
                        <div className="flex justify-between text-[10px] text-[var(--app-text-secondary)] mb-1">{t('layout.verticalPosition')} <span>{previewedSceneSettings.screenshotY}</span></div>
                        <div className="flex items-center gap-2">
                          <input type="range" min="-1000" max="1000" step="10" value={previewedSceneSettings.screenshotY} onChange={(e) =>
                            queueDragPreview('screenshot', { screenshotY: parseInt(e.target.value) })}
                            onPointerUp={() => commitDragPreview('screenshot')}
                            onBlur={() => commitDragPreview('screenshot')}
                            className="flex-1 h-1 bg-[var(--app-control-track)] rounded-lg appearance-none cursor-pointer accent-[var(--app-accent)]"
                          />
                          <button onClick={() => { clearDragPreview(); resetSceneSetting('screenshotY'); }} className="p-1 text-[var(--app-text-muted)] hover:text-[var(--app-accent)] opacity-0 group-hover:opacity-100 transition"><RotateCcw className="w-3 h-3" /></button>
                        </div>
                      </div>
                      <div className="group">
                        <div className="flex justify-between text-[10px] text-[var(--app-text-secondary)] mb-1">{t('layout.horizontalPosition')} <span>{previewedSceneSettings.screenshotX}</span></div>
                        <div className="flex items-center gap-2">
                          <input type="range" min="-1000" max="1000" step="10" value={previewedSceneSettings.screenshotX}
                            onChange={(e) => queueDragPreview('screenshot', { screenshotX: parseInt(e.target.value) })}
                            onPointerUp={() => commitDragPreview('screenshot')}
                            onBlur={() => commitDragPreview('screenshot')}
                            className="flex-1 h-1 bg-[var(--app-control-track)] rounded-lg appearance-none cursor-pointer accent-[var(--app-accent)]"
                          />
                          <button onClick={() => { clearDragPreview(); resetSceneSetting('screenshotX'); }} className="p-1 text-[var(--app-text-muted)] hover:text-[var(--app-accent)] opacity-0 group-hover:opacity-100 transition"><RotateCcw className="w-3 h-3" /></button>
                        </div>
                      </div>
                      {/* Screenshot Shadow Toggle */}
                      <div className="pt-2 mt-2 border-t border-gray-700/50">
                        <label className={`flex items-center gap-2 text-[10px] text-[var(--app-text-secondary)] ${mockupEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input
                            type="checkbox"
                            checked={activeSceneSettings.screenshotShadow !== false}
                            onChange={(e) => updateSceneSettings('screenshotShadow', e.target.checked)}
                            disabled={mockupEnabled}
                            className="rounded bg-[var(--app-input-bg)] border-[var(--app-border)] text-[var(--app-accent)] disabled:opacity-50"
                          />
                          {t('layout.screenshotShadow')}
                          {mockupEnabled && <span className="text-[10px] ml-auto italic opacity-70">({t('layout.disabledByMockup')})</span>}
                        </label>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Device Mockup Controls */}
                  {(selectedElement === 'device' || !mockupEnabled) && (
                    <div className="space-y-3">
                      <DeviceMockup
                        enabled={mockupEnabled}
                        setEnabled={setMockupEnabled}
                        selectedDevice={selectedDevice}
                        setSelectedDevice={setSelectedDevice}
                        frameColor={deviceFrameColor}
                        setFrameColor={setDeviceFrameColor}
                        showLockScreen={showLockScreenUI}
                        setShowLockScreen={setShowLockScreenUI}
                        showShadow={showMockupShadow}
                        setShowShadow={setShowMockupShadow}
                        shadowOpacity={shadowOpacity}
                        setShadowOpacity={setShadowOpacity}
                        deviceScale={previewedDeviceState.deviceScale}
                        setDeviceScale={(value) => queueDragPreview('device', { deviceScale: value })}
                        deviceX={previewedDeviceState.deviceX}
                        setDeviceX={(value) => queueDragPreview('device', { deviceX: value })}
                        deviceY={previewedDeviceState.deviceY}
                        setDeviceY={(value) => queueDragPreview('device', { deviceY: value })}
                        commitDeviceTransformPreview={() => commitDragPreview('device')}
                        resetDeviceTransformControl={(key, value) => {
                          clearDragPreview();
                          applyDeviceTransformPatch({ [key]: value });
                        }}
                        iPadLandscape={iPadLandscape}
                        setiPadLandscape={setiPadLandscape}
                        t={t}
                      />
                    </div>
                  )}
                </div>
              </div>
              )}
            </div>
          </div >
        )
      }

      {/* 底部进度条 */}
      {
        importProgress.active && (
          <div className="fixed bottom-0 left-0 right-0 bg-[var(--app-bg-header)] border-t border-[var(--app-border)] px-4 py-2 z-50">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-1 gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`inline-flex w-2 h-2 rounded-full ${importProgress.status === 'error'
                        ? 'bg-red-500'
                        : importProgress.status === 'warning'
                          ? 'bg-amber-500'
                          : importProgress.status === 'success'
                            ? 'bg-green-500'
                            : 'bg-[var(--app-accent)]'
                        }`}></span>
                      <span className="truncate">{importProgress.message}</span>
                    </div>
                    {importProgress.detail && (
                      <div className="text-[10px] text-[var(--app-text-muted)] mt-1 truncate">
                        {importProgress.detail}
                      </div>
                    )}
                  </div>
                  <span className="shrink-0">
                    {importProgress.total > 0 ? `${importProgress.current} / ${importProgress.total}` : `${importProgressPercent}%`}
                  </span>
                </div>
                <div className="h-1.5 bg-[var(--app-bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ease-out ${importProgressBarClass}`}
                    style={{ width: `${importProgressPercent}%` }}
                  />
                </div>
                {importProgress.phase === 'translate' && (importProgress.successCount > 0 || importProgress.failedCount > 0 || importProgress.skippedCount > 0) && (
                  <div className="flex gap-3 mt-1 text-[10px] text-[var(--app-text-muted)]">
                    <span>{t('alerts.translationSummarySuccess', '成功')}: {importProgress.successCount}</span>
                    <span>{t('alerts.translationSummaryFailed', '失败')}: {importProgress.failedCount}</span>
                    {importProgress.skippedCount > 0 && (
                      <span>{t('alerts.translationSummarySkipped', '跳过')}: {importProgress.skippedCount}</span>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleCloseImportProgress}
                className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded border border-[var(--app-border)] bg-[var(--app-bg-elevated)] text-[var(--app-text-muted)] hover:text-white hover:border-[var(--app-accent)] transition"
                aria-label={t('common.closeProgress', '关闭进度')}
                title={t('common.closeProgress', '关闭进度')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default App;
