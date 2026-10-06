/**
 * IconFabric 平台图标规格配置
 * 定义各平台的图标尺寸、格式和特殊处理规则
 */

// Apple 图标尺寸规格
export const IOS_ICON_SIZES = [
    { size: 1024, scale: 1, idiom: 'ios-marketing', filename: 'Icon-1024.png' },
    { size: 180, scale: 3, idiom: 'iphone', filename: 'Icon-60@3x.png' },
    { size: 120, scale: 2, idiom: 'iphone', filename: 'Icon-60@2x.png' },
    { size: 167, scale: 2, idiom: 'ipad', filename: 'Icon-83.5@2x.png' },
    { size: 152, scale: 2, idiom: 'ipad', filename: 'Icon-76@2x.png' },
    { size: 76, scale: 1, idiom: 'ipad', filename: 'Icon-76.png' },
    { size: 40, scale: 3, idiom: 'iphone', filename: 'Icon-40@3x.png' },
    { size: 80, scale: 2, idiom: 'iphone', filename: 'Icon-40@2x.png' },
    { size: 40, scale: 1, idiom: 'ipad', filename: 'Icon-40.png' },
    { size: 60, scale: 3, idiom: 'iphone', filename: 'Icon-20@3x.png' },
    { size: 40, scale: 2, idiom: 'iphone', filename: 'Icon-20@2x.png' },
    { size: 20, scale: 1, idiom: 'ipad', filename: 'Icon-20.png' },
    { size: 87, scale: 3, idiom: 'iphone', filename: 'Icon-29@3x.png' },
    { size: 58, scale: 2, idiom: 'iphone', filename: 'Icon-29@2x.png' },
    { size: 29, scale: 1, idiom: 'ipad', filename: 'Icon-29.png' },
];

export const MACOS_ICON_SIZES = [
    { size: 1024, scale: 2, filename: 'icon_512x512@2x.png' },
    { size: 512, scale: 1, filename: 'icon_512x512.png' },
    { size: 512, scale: 2, filename: 'icon_256x256@2x.png' },
    { size: 256, scale: 1, filename: 'icon_256x256.png' },
    { size: 256, scale: 2, filename: 'icon_128x128@2x.png' },
    { size: 128, scale: 1, filename: 'icon_128x128.png' },
    { size: 64, scale: 2, filename: 'icon_32x32@2x.png' },
    { size: 32, scale: 1, filename: 'icon_32x32.png' },
    { size: 32, scale: 2, filename: 'icon_16x16@2x.png' },
    { size: 16, scale: 1, filename: 'icon_16x16.png' },
];

// Android mipmap 尺寸规格
export const ANDROID_ICON_SIZES = [
    { folder: 'mipmap-xxxhdpi', size: 192, density: 'xxxhdpi' },
    { folder: 'mipmap-xxhdpi', size: 144, density: 'xxhdpi' },
    { folder: 'mipmap-xhdpi', size: 96, density: 'xhdpi' },
    { folder: 'mipmap-hdpi', size: 72, density: 'hdpi' },
    { folder: 'mipmap-mdpi', size: 48, density: 'mdpi' },
];

// Android 自适应图标规格
export const ANDROID_ADAPTIVE_CONFIG = {
    foregroundSize: 108, // dp
    safeZone: 66,        // dp - 核心内容安全区
    maskPadding: 18,     // dp - 遮罩边距
};

// Windows ICO 尺寸
export const WINDOWS_ICO_SIZES = [256, 128, 64, 48, 32, 24, 16];

// Web/PWA 尺寸
export const WEB_ICON_SIZES = [
    { size: 512, filename: 'icon-512.png', purpose: 'PWA' },
    { size: 192, filename: 'icon-192.png', purpose: 'PWA' },
    { size: 180, filename: 'apple-touch-icon.png', purpose: 'iOS Safari' },
    { size: 32, filename: 'favicon-32x32.png', purpose: 'Favicon' },
    { size: 16, filename: 'favicon-16x16.png', purpose: 'Favicon' },
];

// Steam 图标规格
export const STEAM_ICON_CONFIG = {
    communityIcon: { size: 184, filename: 'community_icon.png' },
    clientIcon: { sizes: [16, 32, 64], filename: 'client_icon.ico' },
};

/**
 * 平台配置主结构
 */
export const ICON_PLATFORMS = {
    ios: {
        id: 'ios',
        name: 'iOS App Icon',
        category: 'Apple',
        description: 'iPhone / iPad 应用图标',
        sizes: IOS_ICON_SIZES,
        generateManifest: true,
        manifestType: 'xcode-appiconset',
        // iOS 图标提交时必须是直角正方形，系统自动渲染圆角
        requiresSquare: true,
        autoRoundCorners: false,
    },

    macos_mas: {
        id: 'macos_mas',
        name: 'macOS App Store',
        category: 'Apple',
        description: '提交到 App Store 的图标（系统自动切圆角和加阴影）',
        sizes: MACOS_ICON_SIZES,
        generateIcns: true,
        // MAS 图标：满铺 + 直角 + 无阴影（系统自动处理）
        processing: {
            contentScale: 1.0,         // 100% 满铺
            clipSquircle: false,       // 不切圆角
            addDropShadow: false,      // 不加阴影
            allowCropScale: 2.0,       // 允许放大到 200% 裁切
        },
        preview: {
            showGuide: false,          // 不显示参考线
            simulateSystemRender: true, // 预览时模拟系统渲染效果
        },
    },

    macos_dmg: {
        id: 'macos_dmg',
        name: 'DMG 安装包',
        category: 'Apple',
        description: 'DMG 磁盘图标（需要手动渲染圆角和阴影）',
        sizes: MACOS_ICON_SIZES,
        generateIcns: true,
        // DMG 图标：824px Grid 系统
        processing: {
            contentScale: 824 / 1024,  // 80.47% = 824/1024
            bodySize: 824,             // 主体尺寸
            canvasSize: 1024,          // 画布尺寸
            padding: 100,              // (1024-824)/2 = 100px 边距
            clipSquircle: true,        // 必须切圆角
            squircleRadius: 0.225,     // Squircle 圆角比例
            addDropShadow: true,       // 必须加阴影
            shadowSettings: {
                color: 'rgba(0, 0, 0, 0.25)',
                blur: 25,
                offsetX: 0,
                offsetY: 12,
            },
        },
        preview: {
            showGuide: true,           // 显示 824px 参考线
            guideSize: 824,            // 参考线尺寸
            backgroundColor: '#f5f5f7', // 模拟 Finder 背景
        },
    },


    android: {
        id: 'android',
        name: 'Android Adaptive Icon',
        category: 'Android',
        description: 'Google Play 自适应图标',
        sizes: ANDROID_ICON_SIZES,
        adaptiveConfig: ANDROID_ADAPTIVE_CONFIG,
        // 生成 foreground/background 分层
        generateAdaptiveLayers: true,
        // 预览形状
        previewShapes: ['circle', 'roundedSquare', 'squircle'],
    },

    steam: {
        id: 'steam',
        name: 'Steam 图标',
        category: 'Steam',
        description: 'Steam 社区和客户端图标',
        config: STEAM_ICON_CONFIG,
        generateIco: true,
    },

    windows: {
        id: 'windows',
        name: 'Windows 应用图标',
        category: 'Windows',
        description: 'Windows .ico 格式图标',
        icoSizes: WINDOWS_ICO_SIZES,
        generateIco: true,
    },

    web: {
        id: 'web',
        name: 'Web & PWA',
        category: 'Web',
        description: 'Favicon 和 PWA 图标',
        sizes: WEB_ICON_SIZES,
        generateIco: true, // favicon.ico
        generateManifest: true,
        manifestType: 'webmanifest',
    },
};

/**
 * 获取平台分类列表
 */
export const getPlatformsByCategory = () => {
    const categories = {};
    Object.values(ICON_PLATFORMS).forEach(platform => {
        if (!categories[platform.category]) {
            categories[platform.category] = [];
        }
        categories[platform.category].push(platform);
    });
    return categories;
};

/**
 * 默认导出选项
 */
export const DEFAULT_EXPORT_OPTIONS = {
    ios: true,
    macos_mas: true,
    macos_dmg: false,
    android: true,
    steam: false,
    windows: false,
    web: true,
};
