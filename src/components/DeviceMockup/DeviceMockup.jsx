import React from 'react';
import { Smartphone, Tablet, Laptop, Monitor, Watch, RotateCcw, Save, Check } from 'lucide-react';
import './DeviceMockup.css';

/**
 * 设备配置数据
 * 所有尺寸基于设计稿像素值，渲染时会按比例缩放
 * 
 * 素材替换说明：
 * - 将 PNG 素材放入 public/devices/{deviceId}/ 目录
 * - frame.png: 设备边框（屏幕区域透明）
 * - ui_overlay.png: 锁屏 UI 覆盖层
 * - 代码会自动优先使用 PNG 素材
 */
export const DEVICE_CONFIGS = {
  'iphone-17-pro-max': {
    id: 'iphone-17-pro-max',
    name: 'iPhone',
    icon: Smartphone,
    // 使用单一 SVG 素材
    useSvgLayers: true,
    // SVG 文件路径
    svgPath: '/设备外形/iphone.svg',
    // 投影 PNG 文件路径
    shadowPng: '/设备外形/iphone投影.png',
    // 投影变换参数 (基于 SVG 中的 image 标签属性)
    shadowTransform: {
      width: 345,
      height: 605,
      x: 25,
      y: 46.5,
      scale: 1,
    },
    // SVG 图层 ID 映射
    svgLayerIds: {
      frame: '_外壳',
      ui: '_屏幕ui',
      shadow: '_投影',
      colorTarget: '_外壳颜色',
    },
    // 外壳颜色对应的 CSS 类名
    colorClass: 'st8',
    // 屏幕区域 (基于 SVG 中的背景蒙版位置)
    screen: {
      x: 78.24,
      y: 74.59,
      width: 236.83,
      height: 514.89,
    },
    // 屏幕圆角半径
    cornerRadius: 38.31,
    // 设备边框外尺寸 (基于 SVG viewBox)
    frameSize: {
      width: 391.85,
      height: 663.97,
    },
    // 边框厚度
    bezelWidth: 78.24,
    // Dynamic Island 配置 (由 SVG 灵动岛层提供)
    dynamicIsland: null,
    // 是否支持锁屏 UI (由 SVG 手机UI层提供)
    hasLockScreen: true,
    // 是否横屏显示
    isLandscape: false,
    // 可选外壳颜色 (替换 SVG 中 _外壳颜色 的 fill)
    frameColors: [
      { id: 'natural-titanium', name: '原色钛金属', value: '#C2BCB2' },
      { id: 'desert-titanium', name: '沙漠色钛金属', value: '#BFA48F' },
      { id: 'white-titanium', name: '白色钛金属', value: '#F2F1ED' },
      { id: 'black-titanium', name: '黑色钛金属', value: '#3C3C3D' },
    ],
    // 默认外壳颜色
    defaultFrameColor: '#C2BCB2',
  },

  'ipad-pro': {
    id: 'ipad-pro',
    name: 'iPad',
    icon: Tablet,
    // 使用单一 SVG 素材
    useSvgLayers: true,
    // SVG 文件路径
    svgPath: '/设备外形/ipad.svg',
    // 投影 PNG 文件路径
    shadowPng: '/设备外形/ipad投影.png',
    // 投影变换参数
    shadowTransform: {
      width: 820,
      height: 609,
      x: 57,
      y: 11.1,
      scale: 1,
    },
    // SVG 图层 ID 映射
    svgLayerIds: {
      frame: '_手机外壳',
      ui: '_屏幕ui',
      shadow: '_投影',
      colorTarget: '_外壳颜色',
    },
    // 外壳颜色对应的 CSS 类名
    colorClass: 'st6',
    screen: {
      x: 109.7,
      y: 62.5,
      width: 717,
      height: 498,
    },
    cornerRadius: 23.1,
    frameSize: {
      width: 917.7,
      height: 616.1,
    },
    bezelWidth: 109.7,
    dynamicIsland: null,
    hasLockScreen: true,
    isLandscape: true, // iPad 默认横屏
    frameColors: [
      { id: 'space-black', name: '深空黑色', value: '#2E2C2E' },
      { id: 'silver', name: '银色', value: '#E3E4E6' },
    ],
    defaultFrameColor: '#2E2C2E',
  },

  'macbook-pro': {
    id: 'macbook-pro',
    name: 'MacBook',
    icon: Laptop,
    // 使用单一 SVG 素材
    useSvgLayers: true,
    // SVG 文件路径
    svgPath: '/设备外形/macbook.svg',
    // 投影 PNG 文件路径
    shadowPng: '/设备外形/macbook投影.png',
    // 投影变换参数
    shadowTransform: {
      width: 975,
      height: 94,
      x: 7,
      y: 545.6,
      scale: 1,
    },
    // SVG 图层 ID 映射
    svgLayerIds: {
      frame: '_外壳',
      ui: '_屏幕ui',
      shadow: '_投影',
      colorTarget: '_外壳颜色',
    },
    // 外壳颜色对应的 CSS 类名
    colorClass: 'st10',
    screen: {
      x: 138.22,
      y: 66.32,
      width: 714.91,
      height: 462.74,
    },
    cornerRadius: 9.39,
    frameSize: {
      width: 988.73,
      height: 639.62,
    },
    bezelWidth: 138.22,
    bezelTop: 66.32,
    // 刘海配置
    notch: {
      width: 77.32,
      height: 11.68,
      radius: 4.34,
    },
    // 底座配置
    base: {
      height: 77.28,
      frontHeight: 16,
      hingeHeight: 10,
    },
    hasLockScreen: true, // MacBook 有屏幕 UI 层
    isLandscape: true,
    frameColors: [
      { id: 'space-black', name: '深空黑色 (M4)', value: '#2E2C2E' },
      { id: 'silver', name: '银色', value: '#E3E4E6' },
      { id: 'space-gray', name: '深空灰色', value: '#7D7E80' },
      { id: 'midnight', name: '午夜色 (Air)', value: '#2E3642' },
      { id: 'starlight', name: '星光色 (Air)', value: '#F0E0D0' },
    ],
    defaultFrameColor: '#2E2C2E',
  },

  'android': {
    id: 'android',
    name: 'Android',
    icon: Smartphone,
    useSvgLayers: true,
    svgPath: '/设备外形/Android.svg',
    shadowPng: '/设备外形/Android投影.png',
    // 投影变换参数
    shadowTransform: {
      width: 326,
      height: 597,
      x: 43,
      y: 79.1,
      scale: 1,
    },
    svgLayerIds: {
      frame: '_外壳',
      ui: '_手机ui',
      shadow: '_投影',
      colorTarget: '_外壳颜色',
    },
    colorClass: 'st2',
    screen: {
      x: 88,
      y: 113,
      width: 236.7,
      height: 512.9,
    },
    cornerRadius: 19.8,
    frameSize: {
      width: 402.2,
      height: 725.1,
    },
    bezelWidth: 88,
    dynamicIsland: null,
    hasLockScreen: true,
    isLandscape: false,
    frameColors: [
      { id: 'black', name: '黑色', value: '#231815' },
      { id: 'white', name: '白色', value: '#F5F5F5' },
      { id: 'midnight', name: '午夜蓝', value: '#1E2833' },
      { id: 'green', name: '绿色', value: '#2E4F3A' },
      { id: 'purple', name: '紫色', value: '#4A3E5C' },
    ],
    defaultFrameColor: '#231815',
  },

  'imac': {
    id: 'imac',
    name: 'iMac',
    icon: Monitor,
    useSvgLayers: true,
    svgPath: '/设备外形/imac.svg',
    shadowPng: '/设备外形/imac投影.png',
    // 投影变换参数
    shadowTransform: {
      width: 718,
      height: 86,
      x: 100,
      y: 515.8,
      scale: 1,
    },
    svgLayerIds: {
      frame: '_外壳',
      ui: '_屏幕ui',
      shadow: '_投影',
      colorTarget: '_外壳颜色',
    },
    colorClass: 'st7',
    screen: {
      x: 150.7,
      y: 30.9,
      width: 620,
      height: 358.5,
    },
    cornerRadius: 0,
    frameSize: {
      width: 917.7,
      height: 660.8,
    },
    bezelWidth: 150.7,
    dynamicIsland: null,
    hasLockScreen: true, // iMac 有屏幕 UI 层
    isLandscape: true,
    frameColors: [
      { id: 'blue', name: '蓝色', value: '#4477BB' },
      { id: 'purple', name: '紫色', value: '#665599' },
      { id: 'pink', name: '粉色', value: '#DD5566' },
      { id: 'orange', name: '橙色', value: '#EE7733' },
      { id: 'yellow', name: '黄色', value: '#F0C020' },
      { id: 'green', name: '绿色', value: '#449966' },
      { id: 'silver', name: '银色', value: '#C0C0C0' },
    ],
    defaultFrameColor: '#4477BB',
  },

  'apple-watch': {
    id: 'apple-watch',
    name: 'Apple Watch',
    icon: Watch,
    useSvgLayers: true,
    svgPath: '/设备外形/iwatch.svg',
    shadowPng: '/设备外形/iwatch投影.png',
    // 投影变换参数
    shadowTransform: {
      width: 341,
      height: 550,
      x: 282,
      y: 17.6,
      scale: 1,
    },
    svgLayerIds: {
      frame: '_外壳',
      ui: '_屏幕ui',
      shadow: '_投影',
      colorTarget: '_外壳颜色',
    },
    colorClass: 'st2',
    screen: {
      x: 324.5,
      y: 141.1,
      width: 241.1,
      height: 291.5,
    },
    cornerRadius: 58.1,
    frameSize: {
      width: 934,
      height: 598.6,
    },
    bezelWidth: 324.5,
    dynamicIsland: null,
    hasLockScreen: true,
    isLandscape: false,
    frameColors: [
      { id: 'natural-titanium', name: '原色钛金属 (Ultra)', value: '#C2BCB2' },
      { id: 'black-titanium', name: '黑色钛金属 (Ultra)', value: '#3C3C3D' },
      { id: 'jet-black', name: '亮黑色', value: '#181819' },
      { id: 'rose-gold', name: '玫瑰金', value: '#E6C7C2' },
      { id: 'silver', name: '银色', value: '#E3E4E6' },
    ],
    defaultFrameColor: '#C2BCB2',
  },

  // Apple Family Composite - 所有苹果设备合照
  'apple-family': {
    id: 'apple-family',
    name: 'Apple Family',
    icon: Monitor, // 使用 Monitor 图标
    isComposite: true, // 标记为合成模式
    // 包含的设备列表（按渲染顺序：底层到顶层）
    devices: ['imac', 'macbook-pro', 'ipad-pro', 'iphone-17-pro-max', 'apple-watch'],
    // 每个设备的布局配置（相对于画布的百分比位置和缩放）
    // 布局参考用户提供的图片：iMac 后排中央，MacBook 右侧，iPad 左侧横屏，iPhone 中间，Watch 左前
    layout: {
      'imac': {
        scale: 0.6,        // 放大 iMac 作为背景主体
        x: 0.5,            // 居中
        y: 0.1,            // 稍微靠上
        zIndex: 1,
      },
      'macbook-pro': {
        scale: 0.40,
        x: 0.76,            // 右侧，与 iMac 重叠
        y: 0.17,            // 底部位置
        zIndex: 2,
      },
      'ipad-pro': {
        scale: 0.3,
        x: 0.24,            // 左侧，与 iMac 重叠
        y: 0.2,
        zIndex: 3,
      },
      'iphone-17-pro-max': {
        scale: 0.12,
        x: 0.4,            // 中间偏左，挡住 iMac 底座
        y: 0.22,            // 前排
        zIndex: 5,
      },
      'apple-watch': {
        scale: 0.15,
        x: 0.35,            // iPad 和 iPhone 之间
        y: 0.3,            // 最前排
        zIndex: 6,
      },
    },
    // 不需要单独的屏幕/边框配置，使用子设备的配置
    hasLockScreen: false,
    isLandscape: true,
    frameColors: [
      { id: 'silver', name: '银色', value: '#E3E4E6' },
      { id: 'space-black', name: '深空黑', value: '#2E2C2E' },
      { id: 'gold', name: '金色', value: '#F5E6D3' },
      { id: 'blue', name: '蓝色', value: '#4477BB' },
      { id: 'green', name: '绿色', value: '#449966' },
    ],
    defaultFrameColor: '#E3E4E6',
  },
};

/**
 * 生成设备边框 SVG
 * @param {string} deviceId - 设备 ID
 * @param {string} frameColor - 边框颜色
 * @param {boolean} isPortrait - 是否竖屏模式 (仅 iPad 适用)
 * @returns {string} SVG 字符串
 */
export const generateDeviceFrameSVG = (deviceId, frameColor, isPortrait = false) => {
  const config = DEVICE_CONFIGS[deviceId];
  if (!config) return null;

  if (deviceId === 'iphone-17-pro-max') {
    return generateiPhoneSVG(config, frameColor);
  } else if (deviceId === 'ipad-pro') {
    return generateiPadSVG(config, frameColor, isPortrait);
  } else if (deviceId === 'macbook-pro') {
    return generateMacBookSVG(config, frameColor);
  }

  return null;
};

/**
 * 生成 iPhone 边框 SVG
 */
const generateiPhoneSVG = (config, frameColor) => {
  const { frameSize, screen, cornerRadius, bezelWidth, dynamicIsland } = config;
  const outerRadius = cornerRadius + 8;

  // 计算屏幕中心位置（用于 Dynamic Island）
  const screenCenterX = screen.x + screen.width / 2;

  // 使用 path 的 fill-rule: evenodd 来镂空屏幕区域
  // 外框顺时针，内框逆时针，创建镂空效果
  return `
<svg width="${frameSize.width}" height="${frameSize.height}" viewBox="0 0 ${frameSize.width} ${frameSize.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- 高光渐变 -->
    <linearGradient id="frameHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.15)"/>
      <stop offset="50%" style="stop-color:rgba(255,255,255,0)"/>
      <stop offset="100%" style="stop-color:rgba(0,0,0,0.1)"/>
    </linearGradient>
    
    <!-- 裁切路径 - 屏幕区域镂空 -->
    <clipPath id="screenCutout">
      <path fill-rule="evenodd" d="
        M ${outerRadius} 0 
        H ${frameSize.width - outerRadius} 
        Q ${frameSize.width} 0 ${frameSize.width} ${outerRadius} 
        V ${frameSize.height - outerRadius} 
        Q ${frameSize.width} ${frameSize.height} ${frameSize.width - outerRadius} ${frameSize.height} 
        H ${outerRadius} 
        Q 0 ${frameSize.height} 0 ${frameSize.height - outerRadius} 
        V ${outerRadius} 
        Q 0 0 ${outerRadius} 0 
        Z
        
        M ${screen.x + cornerRadius} ${screen.y}
        V ${screen.y}
        Q ${screen.x} ${screen.y} ${screen.x} ${screen.y + cornerRadius}
        V ${screen.y + screen.height - cornerRadius}
        Q ${screen.x} ${screen.y + screen.height} ${screen.x + cornerRadius} ${screen.y + screen.height}
        H ${screen.x + screen.width - cornerRadius}
        Q ${screen.x + screen.width} ${screen.y + screen.height} ${screen.x + screen.width} ${screen.y + screen.height - cornerRadius}
        V ${screen.y + cornerRadius}
        Q ${screen.x + screen.width} ${screen.y} ${screen.x + screen.width - cornerRadius} ${screen.y}
        Z
      "/>
    </clipPath>
  </defs>
  
  <!-- 设备边框主体 (带镂空) -->
  <rect 
    x="0" y="0" 
    width="${frameSize.width}" height="${frameSize.height}" 
    rx="${outerRadius}" ry="${outerRadius}"
    fill="${frameColor}"
    clip-path="url(#screenCutout)"
  />
  
  <!-- 边框高光层 -->
  <rect 
    x="0" y="0" 
    width="${frameSize.width}" height="${frameSize.height}" 
    rx="${outerRadius}" ry="${outerRadius}"
    fill="url(#frameHighlight)"
    clip-path="url(#screenCutout)"
  />
  
  <!-- 边框内边缘线 -->
  <rect 
    x="${screen.x - 1}" y="${screen.y - 1}" 
    width="${screen.width + 2}" height="${screen.height + 2}" 
    rx="${cornerRadius + 1}" ry="${cornerRadius + 1}"
    fill="none"
    stroke="rgba(0,0,0,0.4)"
    stroke-width="1"
  />
  
  <!-- Dynamic Island -->
  ${dynamicIsland ? `
  <rect 
    x="${screenCenterX - dynamicIsland.width / 2}" 
    y="${screen.y + dynamicIsland.y}" 
    width="${dynamicIsland.width}" 
    height="${dynamicIsland.height}" 
    rx="${dynamicIsland.radius}" ry="${dynamicIsland.radius}"
    fill="#000000"
  />
  ` : ''}
  
  <!-- 侧边按钮 (右侧电源键) -->
  <rect x="${frameSize.width - 3}" y="140" width="3" height="80" rx="1" fill="${adjustColor(frameColor, -20)}"/>
  
  <!-- 侧边按钮 (左侧音量键) -->
  <rect x="0" y="120" width="3" height="36" rx="1" fill="${adjustColor(frameColor, -20)}"/>
  <rect x="0" y="180" width="3" height="60" rx="1" fill="${adjustColor(frameColor, -20)}"/>
</svg>`;
};

/**
 * 生成 iPad 边框 SVG
 */
const generateiPadSVG = (config, frameColor, isPortrait = false) => {
  let { frameSize, screen, cornerRadius, bezelWidth } = config;

  // 竖屏模式：交换尺寸
  if (isPortrait) {
    screen = {
      x: config.screen.y,
      y: config.screen.x,
      width: config.screen.height,
      height: config.screen.width,
    };
    frameSize = {
      width: config.frameSize.height,
      height: config.frameSize.width,
    };
  }

  const outerRadius = cornerRadius + 10;

  return `
<svg width="${frameSize.width}" height="${frameSize.height}" viewBox="0 0 ${frameSize.width} ${frameSize.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="iPadHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.1)"/>
      <stop offset="100%" style="stop-color:rgba(0,0,0,0.05)"/>
    </linearGradient>
    
    <!-- 裁切路径 - 屏幕区域镂空 -->
    <clipPath id="iPadScreenCutout">
      <path fill-rule="evenodd" d="
        M ${outerRadius} 0 
        H ${frameSize.width - outerRadius} 
        Q ${frameSize.width} 0 ${frameSize.width} ${outerRadius} 
        V ${frameSize.height - outerRadius} 
        Q ${frameSize.width} ${frameSize.height} ${frameSize.width - outerRadius} ${frameSize.height} 
        H ${outerRadius} 
        Q 0 ${frameSize.height} 0 ${frameSize.height - outerRadius} 
        V ${outerRadius} 
        Q 0 0 ${outerRadius} 0 
        Z
        
        M ${screen.x + cornerRadius} ${screen.y}
        V ${screen.y}
        Q ${screen.x} ${screen.y} ${screen.x} ${screen.y + cornerRadius}
        V ${screen.y + screen.height - cornerRadius}
        Q ${screen.x} ${screen.y + screen.height} ${screen.x + cornerRadius} ${screen.y + screen.height}
        H ${screen.x + screen.width - cornerRadius}
        Q ${screen.x + screen.width} ${screen.y + screen.height} ${screen.x + screen.width} ${screen.y + screen.height - cornerRadius}
        V ${screen.y + cornerRadius}
        Q ${screen.x + screen.width} ${screen.y} ${screen.x + screen.width - cornerRadius} ${screen.y}
        Z
      "/>
    </clipPath>
  </defs>
  
  <!-- 主体边框 (带镂空) -->
  <rect 
    x="0" y="0" 
    width="${frameSize.width}" height="${frameSize.height}" 
    rx="${outerRadius}" ry="${outerRadius}"
    fill="${frameColor}"
    clip-path="url(#iPadScreenCutout)"
  />
  
  <!-- 高光层 -->
  <rect 
    x="0" y="0" 
    width="${frameSize.width}" height="${frameSize.height}" 
    rx="${outerRadius}" ry="${outerRadius}"
    fill="url(#iPadHighlight)"
    clip-path="url(#iPadScreenCutout)"
  />
  
  <!-- 屏幕内边框 -->
  <rect 
    x="${screen.x - 1}" y="${screen.y - 1}" 
    width="${screen.width + 2}" height="${screen.height + 2}" 
    rx="${cornerRadius + 1}" ry="${cornerRadius + 1}"
    fill="none"
    stroke="rgba(0,0,0,0.3)"
    stroke-width="1"
  />
  
  <!-- 摄像头 -->
  ${isPortrait
      ? `<circle cx="${frameSize.width / 2}" cy="${screen.y / 2}" r="4" fill="#1a1a1a"/>
       <circle cx="${frameSize.width / 2}" cy="${screen.y / 2}" r="2" fill="#333"/>`
      : `<circle cx="${screen.x / 2}" cy="${frameSize.height / 2}" r="4" fill="#1a1a1a"/>
       <circle cx="${screen.x / 2}" cy="${frameSize.height / 2}" r="2" fill="#333"/>`
    }
</svg>`;
};

/**
 * 生成 MacBook 边框 SVG
 */
const generateMacBookSVG = (config, frameColor) => {
  const { frameSize, screen, cornerRadius, bezelWidth, bezelTop, notch, base } = config;
  const totalHeight = frameSize.height + base.height;
  const outerRadius = cornerRadius + 5;

  // 屏幕区域（用于镂空）
  const screenX = bezelWidth / 2;
  const screenY = bezelTop / 2;
  const screenW = frameSize.width - bezelWidth;
  const screenH = frameSize.height - bezelTop - 20;

  return `
<svg width="${frameSize.width}" height="${totalHeight}" viewBox="0 0 ${frameSize.width} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="macHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.15)"/>
      <stop offset="100%" style="stop-color:rgba(0,0,0,0.05)"/>
    </linearGradient>
    
    <linearGradient id="baseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${adjustColor(frameColor, 10)}"/>
      <stop offset="100%" style="stop-color:${adjustColor(frameColor, -15)}"/>
    </linearGradient>
    
    <!-- 屏幕镂空裁切路径 -->
    <clipPath id="macScreenCutout">
      <path fill-rule="evenodd" d="
        M ${outerRadius} 0 
        H ${frameSize.width - outerRadius} 
        Q ${frameSize.width} 0 ${frameSize.width} ${outerRadius} 
        V ${frameSize.height - outerRadius} 
        Q ${frameSize.width} ${frameSize.height} ${frameSize.width - outerRadius} ${frameSize.height} 
        H ${outerRadius} 
        Q 0 ${frameSize.height} 0 ${frameSize.height - outerRadius} 
        V ${outerRadius} 
        Q 0 0 ${outerRadius} 0 
        Z
        
        M ${screenX + cornerRadius} ${screenY}
        V ${screenY}
        Q ${screenX} ${screenY} ${screenX} ${screenY + cornerRadius}
        V ${screenY + screenH - cornerRadius}
        Q ${screenX} ${screenY + screenH} ${screenX + cornerRadius} ${screenY + screenH}
        H ${screenX + screenW - cornerRadius}
        Q ${screenX + screenW} ${screenY + screenH} ${screenX + screenW} ${screenY + screenH - cornerRadius}
        V ${screenY + cornerRadius}
        Q ${screenX + screenW} ${screenY} ${screenX + screenW - cornerRadius} ${screenY}
        Z
      "/>
    </clipPath>
  </defs>
  
  <!-- 屏幕边框部分 (带镂空) -->
  <rect 
    x="0" y="0" 
    width="${frameSize.width}" height="${frameSize.height}" 
    rx="${outerRadius}" ry="${outerRadius}"
    fill="${frameColor}"
    clip-path="url(#macScreenCutout)"
  />
  
  <!-- 刘海 -->
  <rect 
    x="${(frameSize.width - notch.width) / 2}" y="0" 
    width="${notch.width}" height="${notch.height}" 
    rx="${notch.radius}" ry="${notch.radius}"
    fill="${frameColor}"
  />
  
  <!-- 摄像头 -->
  <circle 
    cx="${frameSize.width / 2}" 
    cy="${notch.height / 2 + 2}" 
    r="4" 
    fill="#1a1a1a"
  />
  <circle 
    cx="${frameSize.width / 2}" 
    cy="${notch.height / 2 + 2}" 
    r="2" 
    fill="#333"
  />
  
  <!-- 屏幕内边框线 -->
  <rect 
    x="${screenX - 1}" y="${screenY - 1}" 
    width="${screenW + 2}" height="${screenH + 2}" 
    rx="${cornerRadius + 1}" ry="${cornerRadius + 1}"
    fill="none"
    stroke="rgba(0,0,0,0.4)"
    stroke-width="1"
  />
  
  <!-- 底座 -->
  <g transform="translate(0, ${frameSize.height - 4})">
    <!-- 铰链部分 -->
    <rect 
      x="${frameSize.width * 0.2}" y="0" 
      width="${frameSize.width * 0.6}" height="${base.hingeHeight}" 
      fill="${adjustColor(frameColor, -25)}"
    />
    
    <!-- 底座主体 -->
    <path 
      d="M ${frameSize.width * 0.05} ${base.hingeHeight} 
         L ${frameSize.width * 0.95} ${base.hingeHeight} 
         L ${frameSize.width * 0.98} ${base.height} 
         Q ${frameSize.width * 0.98} ${base.height + 8} ${frameSize.width * 0.96} ${base.height + 8}
         L ${frameSize.width * 0.04} ${base.height + 8}
         Q ${frameSize.width * 0.02} ${base.height + 8} ${frameSize.width * 0.02} ${base.height}
         Z"
      fill="url(#baseGradient)"
    />
    
    <!-- 底座前缘 -->
    <rect 
      x="${frameSize.width * 0.02}" y="${base.height}" 
      width="${frameSize.width * 0.96}" height="${base.frontHeight}" 
      rx="3" ry="3"
      fill="${adjustColor(frameColor, -30)}"
    />
    
    <!-- 开合凹槽 -->
    <ellipse 
      cx="${frameSize.width / 2}" 
      cy="${base.height + base.frontHeight / 2}" 
      rx="${frameSize.width * 0.08}" 
      ry="4"
      fill="${adjustColor(frameColor, -40)}"
    />
  </g>
</svg>`;
};

/**
 * 调整颜色亮度
 * @param {string} color - 十六进制颜色
 * @param {number} amount - 调整量 (-100 到 100)
 * @returns {string} 调整后的颜色
 */
const adjustColor = (color, amount) => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

/**
 * 将 SVG 字符串转换为可用于 Canvas 的 Image
 * @param {string} svgString - SVG 字符串
 * @returns {Promise<HTMLImageElement>}
 */
export const svgToImage = (svgString) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
};

// SVG 缓存，避免重复加载
const svgCache = new Map();

// 清除 SVG 缓存（用于开发时热更新）
export const clearSvgCache = () => {
  svgCache.clear();
  console.log('[DeviceMockup] SVG cache cleared');
};

// 开发模式下模块热更新时清除缓存
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    clearSvgCache();
  });
}

/**
 * 加载 SVG 文件内容
 * @param {string} svgPath - SVG 文件路径
 * @returns {Promise<string>} SVG 内容字符串
 */
export const loadSvgContent = async (svgPath) => {
  if (svgCache.has(svgPath)) {
    return svgCache.get(svgPath);
  }

  try {
    const response = await fetch(svgPath);
    if (!response.ok) {
      throw new Error(`Failed to load SVG: ${svgPath}`);
    }
    let svgContent = await response.text();

    // 获取 SVG 文件的基础目录路径
    const basePath = svgPath.substring(0, svgPath.lastIndexOf('/') + 1);

    // 将 SVG 中的相对路径 PNG 引用转换为绝对路径
    // 匹配 xlink:href="xxx.png" 或 href="xxx.png" 格式
    svgContent = svgContent.replace(
      /(xlink:href|href)="([^"]+\.(png|jpg|jpeg|gif))"/gi,
      (match, attr, relativePath) => {
        // 如果已经是绝对路径或 data URL，不处理
        if (relativePath.startsWith('http') ||
          relativePath.startsWith('/') ||
          relativePath.startsWith('data:')) {
          return match;
        }
        // 转换为绝对路径
        return `${attr}="${basePath}${relativePath}"`;
      }
    );

    svgCache.set(svgPath, svgContent);
    return svgContent;
  } catch (error) {
    console.error('Error loading SVG:', error);
    throw error;
  }
};

/**
 * 修改 SVG 内容：替换外壳颜色、控制 UI 和投影层可见性
 * @param {string} svgContent - 原始 SVG 内容
 * @param {object} options - 修改选项
 * @param {string} options.frameColor - 外壳颜色
 * @param {boolean} options.showUI - 是否显示 UI 层
 * @param {boolean} options.showShadow - 是否显示投影层
 * @param {object} options.deviceConfig - 设备配置（包含 colorClass 和 svgLayerIds）
 * @returns {string} 修改后的 SVG 内容
 */
export const modifySvgLayers = (svgContent, options = {}) => {
  const { frameColor, showUI = true, showShadow = true, deviceConfig } = options;

  let modifiedSvg = svgContent;

  // 替换外壳颜色
  if (frameColor) {
    const colorClass = deviceConfig?.colorClass || 'st8';

    // 方法1: 替换 <style> 块中对应 CSS 类的 fill 定义
    // 匹配格式如 ".st8 {\n        fill: #9fa0a0;\n      }" 或 ".st8 { fill: #9fa0a0; }"
    const stylePattern = new RegExp(
      `(\\.${colorClass}\\s*\\{[^}]*fill:\\s*)#[a-fA-F0-9]+`,
      'g'
    );
    modifiedSvg = modifiedSvg.replace(stylePattern, `$1${frameColor}`);

    // 方法2: 替换行内 fill 属性（如果存在）
    // 匹配格式如 <path id="_外壳颜色" class="st8" ...>
    const colorTarget = deviceConfig?.svgLayerIds?.colorTarget || '_外壳颜色';

    // 使用 DOM 解析器处理更复杂的情况
    const parser = new DOMParser();
    const doc = parser.parseFromString(modifiedSvg, 'image/svg+xml');
    const targetElement = doc.getElementById(colorTarget);
    if (targetElement) {
      // 直接设置 style 属性来覆盖 CSS 类的 fill
      const existingStyle = targetElement.getAttribute('style') || '';
      const newStyle = existingStyle.replace(/fill:[^;]+;?/g, '') + `fill: ${frameColor};`;
      targetElement.setAttribute('style', newStyle);

      // 序列化回字符串
      const serializer = new XMLSerializer();
      modifiedSvg = serializer.serializeToString(doc);
    }
  }

  // 控制 UI 层可见性
  if (!showUI) {
    const uiLayerId = deviceConfig?.svgLayerIds?.ui || '_手机ui';
    const parser = new DOMParser();
    const doc = parser.parseFromString(modifiedSvg, 'image/svg+xml');
    const uiElement = doc.getElementById(uiLayerId);
    if (uiElement) {
      uiElement.setAttribute('style', 'display: none;');
      const serializer = new XMLSerializer();
      modifiedSvg = serializer.serializeToString(doc);
    }
  }

  // 控制投影可见性
  if (!showShadow) {
    const shadowLayerId = deviceConfig?.svgLayerIds?.shadow || '_投影';
    const parser = new DOMParser();
    const doc = parser.parseFromString(modifiedSvg, 'image/svg+xml');
    const shadowElement = doc.getElementById(shadowLayerId);
    if (shadowElement) {
      shadowElement.setAttribute('style', 'display: none;');
      const serializer = new XMLSerializer();
      modifiedSvg = serializer.serializeToString(doc);
    }
  }

  return modifiedSvg;
};

/**
 * 从 SVG 中提取单独图层
 * @param {string} svgContent - SVG 内容
 * @param {string} layerId - 图层 ID（如 "_手机外壳", "_手机ui", "_背景蒙版"）
 * @returns {string} 包含指定图层的完整 SVG
 */
export const extractSvgLayer = (svgContent, layerId) => {
  // 解析 SVG
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svg = doc.querySelector('svg');

  if (!svg) return null;

  // 获取 viewBox 和尺寸
  const viewBox = svg.getAttribute('viewBox');
  const width = svg.getAttribute('width') || viewBox?.split(' ')[2];
  const height = svg.getAttribute('height') || viewBox?.split(' ')[3];

  // 获取 defs（样式定义）
  const defs = svg.querySelector('defs');

  // 获取目标图层
  const layer = doc.getElementById(layerId);
  if (!layer) return null;

  // 构建新 SVG
  const newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  newSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  // 保留 xlink 命名空间（用于投影等图片的 xlink:href 引用）
  newSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  if (viewBox) newSvg.setAttribute('viewBox', viewBox);
  if (width) newSvg.setAttribute('width', width);
  if (height) newSvg.setAttribute('height', height);

  // 复制 defs
  if (defs) {
    newSvg.appendChild(defs.cloneNode(true));
  }

  // 复制目标图层
  newSvg.appendChild(layer.cloneNode(true));

  // 序列化为字符串
  const serializer = new XMLSerializer();
  return serializer.serializeToString(newSvg);
};

/**
 * 加载并处理设备 SVG，返回分层的图像对象
 * @param {string} svgPath - SVG 文件路径
 * @param {object} options - 处理选项
 * @param {string} options.frameColor - 外壳颜色
 * @param {boolean} options.showUI - 是否显示 UI 层
 * @param {boolean} options.showShadow - 是否显示投影层
 * @param {object} options.deviceConfig - 设备配置
 * @returns {Promise<{frame: Image, ui: Image|null, shadow: Image|null, fullSvg: string}>}
 */
export const loadDeviceSvgLayers = async (svgPath, options = {}) => {
  const { frameColor, showUI = true, showShadow = true, deviceConfig } = options;

  // 加载原始 SVG
  const svgContent = await loadSvgContent(svgPath);

  // 修改 SVG（颜色、UI 和投影可见性）
  const modifiedSvg = modifySvgLayers(svgContent, {
    frameColor,
    showUI,
    showShadow,
    deviceConfig
  });

  // 获取图层 ID
  const frameLayerId = deviceConfig?.svgLayerIds?.frame || '_外壳';
  const uiLayerId = deviceConfig?.svgLayerIds?.ui || '_手机ui';
  const shadowLayerId = deviceConfig?.svgLayerIds?.shadow || '_投影';

  // 提取外壳层（包含灵动岛和黑色边框）
  const frameSvg = extractSvgLayer(modifiedSvg, frameLayerId);
  const frameImg = frameSvg ? await svgToImage(frameSvg) : null;

  // 提取 UI 层
  let uiImg = null;
  if (showUI) {
    const uiSvg = extractSvgLayer(modifiedSvg, uiLayerId);
    uiImg = uiSvg ? await svgToImage(uiSvg) : null;
  }

  // 加载投影（优先使用 PNG 文件，回退到 SVG 图层）
  let shadowImg = null;
  if (showShadow) {
    if (deviceConfig?.shadowPng) {
      // 直接加载投影 PNG 文件
      try {
        shadowImg = await new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = deviceConfig.shadowPng;
        });
        console.log('[loadDeviceSvgLayers] Shadow PNG loaded:', deviceConfig.shadowPng);
      } catch (e) {
        console.warn('[loadDeviceSvgLayers] Failed to load shadow PNG:', e);
      }
    } else {
      // 回退：从 SVG 提取投影图层
      const shadowSvg = extractSvgLayer(modifiedSvg, shadowLayerId);
      shadowImg = shadowSvg ? await svgToImage(shadowSvg) : null;
    }
  }

  return {
    frame: frameImg,
    ui: uiImg,
    shadow: shadowImg,
    fullSvg: modifiedSvg,
  };
};


/**
 * 生成锁屏 UI 覆盖层 SVG
 * @param {string} deviceId - 设备 ID
 * @param {string} time - 显示时间 (默认 9:41)
 * @param {string} date - 显示日期
 * @returns {string} SVG 字符串
 */
export const generateLockScreenUI = (deviceId, time = '9:41', date = 'Sunday, January 12') => {
  const config = DEVICE_CONFIGS[deviceId];
  if (!config || !config.hasLockScreen) return null;

  const { screen } = config;

  if (deviceId === 'iphone-17-pro-max') {
    return `
<svg width="${screen.width}" height="${screen.height}" viewBox="0 0 ${screen.width} ${screen.height}" xmlns="http://www.w3.org/2000/svg">
  <!-- 状态栏背景渐变 -->
  <defs>
    <linearGradient id="statusBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(0,0,0,0.3)"/>
      <stop offset="100%" style="stop-color:rgba(0,0,0,0)"/>
    </linearGradient>
  </defs>
  
  <!-- 状态栏区域 -->
  <rect x="0" y="0" width="${screen.width}" height="60" fill="url(#statusBarGrad)"/>
  
  <!-- 左侧时间 (状态栏) -->
  <text x="28" y="22" font-family="SF Pro Display, -apple-system, system-ui" font-size="17" font-weight="600" fill="white">
    ${time}
  </text>
  
  <!-- 右侧状态图标 -->
  <g transform="translate(${screen.width - 90}, 8)">
    <!-- 信号强度 -->
    <g transform="translate(0, 0)">
      <rect x="0" y="8" width="3" height="4" rx="0.5" fill="white"/>
      <rect x="5" y="6" width="3" height="6" rx="0.5" fill="white"/>
      <rect x="10" y="4" width="3" height="8" rx="0.5" fill="white"/>
      <rect x="15" y="2" width="3" height="10" rx="0.5" fill="white"/>
    </g>
    
    <!-- WiFi -->
    <g transform="translate(26, 2)">
      <path d="M8 10 L8 10" stroke="white" stroke-width="2" stroke-linecap="round"/>
      <path d="M4 7 Q8 4 12 7" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M1 4 Q8 -1 15 4" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </g>
    
    <!-- 电池 -->
    <g transform="translate(50, 3)">
      <rect x="0" y="0" width="25" height="12" rx="3" fill="none" stroke="white" stroke-width="1.5"/>
      <rect x="25" y="3" width="2" height="6" rx="1" fill="white"/>
      <rect x="2" y="2" width="20" height="8" rx="1.5" fill="#34C759"/>
    </g>
  </g>
  
  <!-- 锁屏时间显示 -->
  <text 
    x="${screen.width / 2}" y="240" 
    font-family="SF Pro Display, -apple-system, system-ui" 
    font-size="96" 
    font-weight="700" 
    fill="white" 
    text-anchor="middle"
    style="letter-spacing: -2px"
  >
    ${time}
  </text>
  
  <!-- 日期显示 -->
  <text 
    x="${screen.width / 2}" y="185" 
    font-family="SF Pro Display, -apple-system, system-ui" 
    font-size="22" 
    font-weight="500" 
    fill="white" 
    text-anchor="middle"
    opacity="0.9"
  >
    ${date}
  </text>
</svg>`;
  }

  if (deviceId === 'ipad-pro') {
    return `
<svg width="${screen.width}" height="${screen.height}" viewBox="0 0 ${screen.width} ${screen.height}" xmlns="http://www.w3.org/2000/svg">
  <!-- 状态栏 -->
  <rect x="0" y="0" width="${screen.width}" height="48" fill="rgba(0,0,0,0.2)"/>
  
  <!-- 时间 -->
  <text x="40" y="32" font-family="SF Pro Display, -apple-system" font-size="18" font-weight="600" fill="white">
    ${time}
  </text>
  
  <!-- 右侧图标 -->
  <g transform="translate(${screen.width - 100}, 14)">
    <!-- WiFi -->
    <g transform="translate(0, 0)">
      <path d="M10 14 L10 14" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M5 10 Q10 6 15 10" stroke="white" stroke-width="2" fill="none"/>
      <path d="M0 6 Q10 0 20 6" stroke="white" stroke-width="2" fill="none"/>
    </g>
    
    <!-- 电池 -->
    <g transform="translate(35, 2)">
      <rect x="0" y="0" width="28" height="14" rx="3" fill="none" stroke="white" stroke-width="1.5"/>
      <rect x="28" y="4" width="3" height="6" rx="1" fill="white"/>
      <rect x="2" y="2" width="23" height="10" rx="2" fill="#34C759"/>
    </g>
  </g>
  
  <!-- 锁屏时间 -->
  <text 
    x="${screen.width / 2}" y="450" 
    font-family="SF Pro Display, -apple-system" 
    font-size="160" 
    font-weight="700" 
    fill="white" 
    text-anchor="middle"
  >
    ${time}
  </text>
  
  <!-- 日期 -->
  <text 
    x="${screen.width / 2}" y="340" 
    font-family="SF Pro Display, -apple-system" 
    font-size="32" 
    font-weight="500" 
    fill="white" 
    text-anchor="middle"
    opacity="0.9"
  >
    ${date}
  </text>
</svg>`;
  }

  return null;
};

/**
 * DeviceMockup 控制面板组件
 */
const DeviceMockup = ({
  enabled,
  setEnabled,
  selectedDevice,
  setSelectedDevice,
  frameColor,
  setFrameColor,
  showLockScreen,
  setShowLockScreen,
  showShadow,
  setShowShadow,
  shadowOpacity,
  setShadowOpacity,
  deviceScale,
  setDeviceScale,
  deviceX,
  setDeviceX,
  deviceY,
  setDeviceY,
  iPadLandscape,
  setiPadLandscape,
  t, // 翻译函数
}) => {
  const currentDevice = DEVICE_CONFIGS[selectedDevice];

  // Force iPad to Landscape since we removed the toggle
  React.useEffect(() => {
    if (selectedDevice === 'ipad-pro' && !iPadLandscape) {
      setiPadLandscape(true);
    }
  }, [selectedDevice, iPadLandscape, setiPadLandscape]);



  return (
    <div className="device-mockup-panel p-4 border-b border-gray-800">
      <h3 className="text-[10px] uppercase text-gray-500 font-semibold mb-4 flex items-center gap-2">
        <Smartphone className="w-3 h-3" />
        {t?.('mockup.title') || '设备模拟'}
      </h3>

      {/* 启用开关 */}
      <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer mb-4">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="rounded bg-gray-800 border-gray-700 text-blue-500"
        />
        {t?.('mockup.enable') || '启用设备模拟'}
      </label>

      {enabled && (
        <>
          {/* 设备选择下拉菜单 */}
          <div className="mb-4">
            <div className="text-[10px] text-gray-500 mb-2">
              {t?.('mockup.selectDevice') || '选择设备'}
            </div>
            <div className="relative">
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white appearance-none cursor-pointer hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(DEVICE_CONFIGS).map(([id, config]) => (
                  <option key={id} value={id}>
                    {config.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>



          {/* 设备缩放控制 */}
          <div className="mb-3 group/scale">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>{t?.('layout.scale') || '缩放'}</span>
              <span className="font-mono">{Math.round(deviceScale * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.3"
                max="4.0"
                step="0.05"
                value={deviceScale}
                onChange={(e) => setDeviceScale(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <button
                onClick={() => setDeviceScale(1.0)}
                className="text-gray-500 hover:text-blue-400 opacity-0 group-hover/scale:opacity-100 transition"
                title="重置"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 设备位置控制 - Y */}
          <div className="mb-3 group/y">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>{t?.('layout.verticalPosition') || '垂直位置 (Y)'}</span>
              <span className="font-mono">{deviceY}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="2000"
                step="10"
                value={deviceY}
                onChange={(e) => setDeviceY(parseInt(e.target.value))}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <button
                onClick={() => setDeviceY(400)}
                className="text-gray-500 hover:text-blue-400 opacity-0 group-hover/y:opacity-100 transition"
                title="重置"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 设备位置控制 - X */}
          <div className="mb-4 group/x">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>{t?.('layout.horizontalPosition') || '水平位置 (X)'}</span>
              <span className="font-mono">{deviceX}</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-1000"
                max="1000"
                step="10"
                value={deviceX}
                onChange={(e) => setDeviceX(parseInt(e.target.value))}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <button
                onClick={() => setDeviceX(0)}
                className="text-gray-500 hover:text-blue-400 opacity-0 group-hover/x:opacity-100 transition"
                title="重置"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 边框颜色选择 */}
          <div className="mb-4">
            <div className="text-[10px] text-gray-500 mb-2">
              {t?.('mockup.frameColor') || '边框颜色'}
            </div>
            <div className="flex flex-wrap gap-2">
              {currentDevice?.frameColors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setFrameColor(color.value)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${frameColor === color.value
                    ? 'border-blue-500 scale-110'
                    : 'border-gray-600 hover:border-gray-400'
                    }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* 锁屏 UI 开关 */}
          {currentDevice?.hasLockScreen && (
            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showLockScreen}
                onChange={(e) => setShowLockScreen(e.target.checked)}
                className="rounded bg-gray-800 border-gray-700 text-blue-500"
              />
              {t?.('mockup.showLockScreen') || '显示锁屏 UI'}
            </label>
          )}

          {/* 投影开关 */}
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={showShadow}
              onChange={(e) => setShowShadow(e.target.checked)}
              className="rounded bg-gray-800 border-gray-700 text-blue-500"
            />
            {t?.('mockup.showShadow') || '显示投影'}
          </label>

          {/* 投影透明度滑块 */}
          {showShadow && (
            <div className="pl-6 mb-4 group/shadow">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>{t?.('mockup.opacity') || '透明度'}</span>
                <span className="font-mono">{Math.round((shadowOpacity || 0.5) * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={shadowOpacity || 0.5}
                  onChange={(e) => setShadowOpacity && setShadowOpacity(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <button
                  onClick={() => setShadowOpacity && setShadowOpacity(0.5)}
                  className="text-gray-500 hover:text-blue-400 opacity-0 group-hover/shadow:opacity-100 transition"
                  title="重置"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 设备信息提示 */}
          <div className="mt-4 pt-3 border-t border-gray-800/50">
            <div className="text-[9px] text-gray-600 space-y-1">
              {currentDevice?.isComposite ? (
                <>
                  <div className="flex justify-between">
                    <span>模式:</span>
                    <span>复合设备</span>
                  </div>
                  <div className="flex justify-between">
                    <span>包含设备:</span>
                    <span>{currentDevice?.devices?.length || 0} 个</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>屏幕尺寸:</span>
                    <span className="font-mono">
                      {selectedDevice === 'ipad-pro' && !iPadLandscape
                        ? `${currentDevice?.screen?.height} × ${currentDevice?.screen?.width}`
                        : `${currentDevice?.screen?.width} × ${currentDevice?.screen?.height}`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>方向:</span>
                    <span>
                      {selectedDevice === 'ipad-pro'
                        ? (iPadLandscape ? '横屏' : '竖屏')
                        : (currentDevice?.isLandscape ? '横屏' : '竖屏')
                      }
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>


        </>
      )}
    </div>
  );
};

export default DeviceMockup;
