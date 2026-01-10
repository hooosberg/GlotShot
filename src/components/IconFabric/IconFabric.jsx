import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, RotateCcw, Move, Layers, LayoutTemplate, Palette, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { loadImage, canvasToBase64, drawSquirclePath, resizeImage } from '../../utils/imageProcessor';
import { useTranslation } from '../../locales/i18n';

/**
 * 全能图标工厂 Pro v2
 * 基于官方规范重构：简化导出，只输出核心底图
 * 
 * 导出规范:
 * - Apple: 1024×1024 PNG (不透明)
 * - Android: 512×512 PNG (满铺正方形)
 * - Windows: 256×256 PNG (透明)
 * - Steam: 512×512 PNG (透明)
 */

// SVG Path Data for Official Logos
const ICONS = {
    apple: (props) => (
        <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
            <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282" />
        </svg>
    ),
    android: (props) => (
        <svg viewBox="0 0 512 512" fill="currentColor" {...props}>
            <path d="M380.91,199l42.47-73.57a8.63,8.63,0,0,0-3.12-11.76,8.52,8.52,0,0,0-11.71,3.12l-43,74.52c-32.83-15-69.78-23.35-109.52-23.35s-76.69,8.36-109.52,23.35l-43-74.52a8.6,8.6,0,1,0-14.83,8.57l42.47,73.57c-47.53,28.21-81.86,72.93-94.88,124.63H475.79C462.77,271.93,428.44,227.21,380.91,199Z" />
        </svg>
    ),
    steam: (props) => (
        <svg viewBox="0 0 16 16" fill="currentColor" {...props}>
            <path d="M.329 10.333A8.01 8.01 0 0 0 7.99 16C12.414 16 16 12.418 16 8s-3.586-8-8.009-8A8.006 8.006 0 0 0 0 7.468l.003.006 4.304 1.769A2.2 2.2 0 0 1 5.62 8.88l1.96-2.844-.001-.04a3.046 3.046 0 0 1 3.042-3.043 3.046 3.046 0 0 1 3.042 3.043 3.047 3.047 0 0 1-3.111 3.044l-2.804 2a2.223 2.223 0 0 1-3.075 2.11 2.22 2.22 0 0 1-1.312-1.568L.33 10.333Z" />
            <path d="M4.868 12.683a1.715 1.715 0 0 0 1.318-3.165 1.7 1.7 0 0 0-1.263-.02l1.023.424a1.261 1.261 0 1 1-.97 2.33l-.99-.41a1.7 1.7 0 0 0 .882.84Zm3.726-6.687a2.03 2.03 0 0 0 2.027 2.029 2.03 2.03 0 0 0 2.027-2.029 2.03 2.03 0 0 0-2.027-2.027m2.03-1.527a1.524 1.524 0 1 1-.002 3.048 1.524 1.524 0 0 1 .002-3.048" />
        </svg>
    ),
    windows: (props) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M0 3.42857L9.42857 2.14286V11.5714H0V3.42857ZM10.2857 2.03571L24 0V11.5714H10.2857V2.03571ZM24 12.4286V24L10.2857 22.0714V12.4286H24ZM9.42857 12.4286V21.9643L0 20.6786V12.4286H9.42857Z" />
        </svg>
    )
};

const PLATFORMS = {
    apple: {
        id: 'apple',
        name: 'Apple',
        desc: 'iOS / macOS App Store',
        type: 'single',
        exportSize: 1024,
        exportName: 'AppIcon_1024x1024.png',
        safeZone: 824, // DMG 视觉修正区
        guide: '满铺不透明图标，Xcode 自动生成所有尺寸'
    },
    android: {
        id: 'android',
        name: 'Android',
        desc: 'Google Play Store',
        type: 'dual',
        exportSize: 512,
        exportName: 'PlayStore_512x512.png',
        safeZone: 606, // 66dp in 1024 canvas
        guide: '核心规范：前景层必须为透明 PNG (镂空) 以透出背景，Play Console 自动裁圆角'
    },
    steam: {
        id: 'steam',
        name: 'Steam',
        desc: 'Desktop Shortcut',
        type: 'single',
        exportSize: 512,
        exportName: 'ShortcutIcon_512x512.png',
        safeZone: 900, // 建议核心内容居中
        guide: '512px 透明 PNG，Steamworks 自动生成 ICO'
    },
    windows: {
        id: 'windows',
        name: 'Windows',
        desc: 'Desktop Icon',
        type: 'single',
        exportSize: 256,
        exportName: 'Icon_256x256.png',
        safeZone: null,
        guide: '256px 透明 PNG，外部工具打包 ICO'
    }
};

const SHAPE_OPTS = [
    { id: 'circle', name: '圆形', icon: '●' },
    { id: 'squircle', name: '圆角矩形', icon: '▢' },
    { id: 'square', name: '方形', icon: '■' },
];

const IconFabric = () => {
    const { t } = useTranslation();
    const [activePlatform, setActivePlatform] = useState('apple');
    const [previewShape, setPreviewShape] = useState('circle');

    const [platformData, setPlatformData] = useState({
        apple: { image: null, canvas: null, scale: 100, offsetX: 0, offsetY: 0 },
        android: {
            foreground: null, fgCanvas: null,
            backgroundType: 'color', backgroundColor: '#448AFF',
            backgroundImage: null, bgCanvas: null,
            scale: 100, offsetX: 0, offsetY: 0
        },
        steam: { image: null, canvas: null, scale: 100, offsetX: 0, offsetY: 0 },
        windows: { image: null, canvas: null, scale: 100, offsetX: 0, offsetY: 0 }
    });

    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isExporting, setIsExporting] = useState(false);

    const editorCanvasRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const bgFileInputRef = useRef(null);

    const CANVAS_SIZE = 1024;

    const updatePlatformData = (platformId, updates) => {
        setPlatformData(prev => ({ ...prev, [platformId]: { ...prev[platformId], ...updates } }));
    };

    const resetSettings = () => {
        updatePlatformData(activePlatform, { scale: 100, offsetX: 0, offsetY: 0 });
    };

    // === 图片上传处理 ===
    const handleFileUpload = async (file, target = 'main') => {
        if (!file || !file.type.startsWith('image/')) return;

        // Android 前景图格式校验
        if (activePlatform === 'android' && target === 'main' && file.type !== 'image/png') {
            alert(t('alerts.androidPngRequired'));
            return;
        }

        try {
            const reader = new FileReader();
            const dataUrl = await new Promise(resolve => {
                reader.onload = e => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
            const img = await loadImage(dataUrl);
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);

            if (target === 'main') {
                if (activePlatform === 'android') {
                    updatePlatformData('android', { foreground: dataUrl, fgCanvas: canvas, scale: 100, offsetX: 0, offsetY: 0 });
                } else {
                    updatePlatformData(activePlatform, { image: dataUrl, canvas, scale: 100, offsetX: 0, offsetY: 0 });
                }
            } else if (target === 'background' && activePlatform === 'android') {
                updatePlatformData('android', { backgroundImage: dataUrl, bgCanvas: canvas, backgroundType: 'image' });
            }
        } catch (e) { console.error(e); }
    };

    // === 编辑器画布绘制 ===
    const drawEditor = useCallback(() => {
        const canvas = editorCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = CANVAS_SIZE; canvas.height = CANVAS_SIZE;
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        const data = platformData[activePlatform];
        const platform = PLATFORMS[activePlatform];

        // 背景
        if (activePlatform === 'android') {
            if (data.backgroundType === 'color') {
                ctx.fillStyle = data.backgroundColor;
                ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            } else if (data.bgCanvas) {
                const aspect = data.bgCanvas.width / data.bgCanvas.height;
                let drawW = CANVAS_SIZE, drawH = CANVAS_SIZE;
                if (aspect > 1) drawW = drawH * aspect; else drawH = drawW / aspect;
                ctx.drawImage(data.bgCanvas, (CANVAS_SIZE - drawW) / 2, (CANVAS_SIZE - drawH) / 2, drawW, drawH);
            }
        } else {
            // 棋盘格背景 (表示透明)
            for (let x = 0; x < CANVAS_SIZE; x += 32) {
                for (let y = 0; y < CANVAS_SIZE; y += 32) {
                    ctx.fillStyle = ((x + y) / 32) % 2 === 0 ? '#1f2937' : '#111827';
                    ctx.fillRect(x, y, 32, 32);
                }
            }
        }

        // 主体图像
        const source = activePlatform === 'android' ? data.fgCanvas : data.canvas;
        if (source) {
            const scale = data.scale / 100;
            const minDim = Math.min(source.width, source.height);
            const cropSize = minDim / scale;
            const srcX = (source.width - cropSize) / 2 - (data.offsetX / CANVAS_SIZE) * cropSize;
            const srcY = (source.height - cropSize) / 2 - (data.offsetY / CANVAS_SIZE) * cropSize;
            ctx.drawImage(source, srcX, srcY, cropSize, cropSize, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        }

        // 辅助线
        ctx.save();
        ctx.lineWidth = 2;
        if (platform.safeZone) {
            const sz = platform.safeZone;
            const p = (CANVAS_SIZE - sz) / 2;

            if (activePlatform === 'android') {
                // Android: 圆形安全区
                ctx.strokeStyle = 'rgba(255, 82, 82, 0.6)';
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, sz / 2, 0, Math.PI * 2);
                ctx.stroke();
                // 十字准星
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.beginPath();
                ctx.moveTo(CANVAS_SIZE / 2, 0); ctx.lineTo(CANVAS_SIZE / 2, CANVAS_SIZE);
                ctx.moveTo(0, CANVAS_SIZE / 2); ctx.lineTo(CANVAS_SIZE, CANVAS_SIZE / 2);
                ctx.stroke();
            } else {
                // Apple/Steam: 方形安全区
                ctx.strokeStyle = 'rgba(0, 190, 255, 0.5)';
                ctx.setLineDash([8, 8]);
                ctx.strokeRect(p, p, sz, sz);
            }
        }
        ctx.restore();
    }, [activePlatform, platformData]);

    // === 预览画布绘制 ===
    const drawPreview = useCallback(() => {
        const pCanvas = previewCanvasRef.current;
        if (!pCanvas) return;
        const ctx = pCanvas.getContext('2d');
        const size = 512;
        pCanvas.width = size; pCanvas.height = size;
        ctx.clearRect(0, 0, size, size);

        // 生成无辅助线的合成图
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = CANVAS_SIZE; tempCanvas.height = CANVAS_SIZE;
        const tCtx = tempCanvas.getContext('2d');
        const data = platformData[activePlatform];

        if (activePlatform === 'android') {
            if (data.backgroundType === 'color') {
                tCtx.fillStyle = data.backgroundColor;
                tCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            } else if (data.bgCanvas) {
                const aspect = data.bgCanvas.width / data.bgCanvas.height;
                let drawW = CANVAS_SIZE, drawH = CANVAS_SIZE;
                if (aspect > 1) drawW = drawH * aspect; else drawH = drawW / aspect;
                tCtx.drawImage(data.bgCanvas, (CANVAS_SIZE - drawW) / 2, (CANVAS_SIZE - drawH) / 2, drawW, drawH);
            }
        }

        const source = activePlatform === 'android' ? data.fgCanvas : data.canvas;
        if (source) {
            const scale = data.scale / 100;
            const minDim = Math.min(source.width, source.height);
            const cropSize = minDim / scale;
            const srcX = (source.width - cropSize) / 2 - (data.offsetX / CANVAS_SIZE) * cropSize;
            const srcY = (source.height - cropSize) / 2 - (data.offsetY / CANVAS_SIZE) * cropSize;
            tCtx.drawImage(source, srcX, srcY, cropSize, cropSize, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        }

        // 渲染预览
        if (activePlatform === 'android' || activePlatform === 'windows') {
            ctx.save();
            ctx.beginPath();
            if (previewShape === 'circle') ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            else if (previewShape === 'squircle') drawSquirclePath(ctx, 0, 0, size, 0.225);
            else ctx.rect(0, 0, size, size);
            ctx.clip();
            ctx.drawImage(tempCanvas, 0, 0, CANVAS_SIZE, CANVAS_SIZE, 0, 0, size, size);
            ctx.restore();
        } else if (activePlatform === 'apple') {
            const bodySize = size * (PLATFORMS.apple.safeZone / CANVAS_SIZE);
            const pad = (size - bodySize) / 2;
            ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.shadowBlur = 15; ctx.shadowOffsetY = 5;
            ctx.save();
            ctx.beginPath();
            drawSquirclePath(ctx, pad, pad, bodySize, 0.22);
            ctx.clip();
            ctx.drawImage(tempCanvas, 0, 0, CANVAS_SIZE, CANVAS_SIZE, pad, pad, bodySize, bodySize);
            ctx.restore();
        } else if (activePlatform === 'steam') {
            ctx.fillStyle = '#1b2838';
            ctx.fillRect(0, 0, size, size);
            const margin = size * 0.08;
            ctx.drawImage(tempCanvas, 0, 0, CANVAS_SIZE, CANVAS_SIZE, margin, margin, size - margin * 2, size - margin * 2);
            ctx.strokeStyle = '#66c0f4'; ctx.lineWidth = 3;
            ctx.strokeRect(margin, margin, size - margin * 2, size - margin * 2);
        } else {
            ctx.drawImage(tempCanvas, 0, 0, CANVAS_SIZE, CANVAS_SIZE, 0, 0, size, size);
        }
    }, [activePlatform, platformData, previewShape]);

    useEffect(() => { drawEditor(); }, [drawEditor]);
    useEffect(() => { drawPreview(); }, [drawPreview]);

    // === 拖拽逻辑 ===
    const handleMouseDown = (e) => {
        setIsDragging(true);
        const rect = editorCanvasRef.current.getBoundingClientRect();
        const data = platformData[activePlatform];
        setDragStart({
            x: e.clientX - rect.left - data.offsetX * (rect.width / CANVAS_SIZE),
            y: e.clientY - rect.top - data.offsetY * (rect.height / CANVAS_SIZE)
        });
    };
    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        const rect = editorCanvasRef.current.getBoundingClientRect();
        const scaleRatio = CANVAS_SIZE / rect.width;
        const data = platformData[activePlatform];
        const newOffsetX = (e.clientX - rect.left - dragStart.x) * scaleRatio;
        const newOffsetY = (e.clientY - rect.top - dragStart.y) * scaleRatio;
        const maxOffset = (data.scale / 100 - 1) * CANVAS_SIZE / 2;
        updatePlatformData(activePlatform, {
            offsetX: Math.max(-maxOffset, Math.min(maxOffset, newOffsetX)),
            offsetY: Math.max(-maxOffset, Math.min(maxOffset, newOffsetY))
        });
    }, [isDragging, activePlatform, platformData, dragStart]);
    const handleMouseUp = useCallback(() => setIsDragging(false), []);
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
        }
    }, [isDragging, handleMouseMove]);

    // === 导出逻辑 (简化版) ===
    const getCompositeCanvas = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = CANVAS_SIZE; tempCanvas.height = CANVAS_SIZE;
        const ctx = tempCanvas.getContext('2d');
        const data = platformData[activePlatform];

        if (activePlatform === 'android') {
            if (data.backgroundType === 'color') {
                ctx.fillStyle = data.backgroundColor;
                ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            } else if (data.bgCanvas) {
                const aspect = data.bgCanvas.width / data.bgCanvas.height;
                let drawW = CANVAS_SIZE, drawH = CANVAS_SIZE;
                if (aspect > 1) drawW = drawH * aspect; else drawH = drawW / aspect;
                ctx.drawImage(data.bgCanvas, (CANVAS_SIZE - drawW) / 2, (CANVAS_SIZE - drawH) / 2, drawW, drawH);
            }
            if (data.fgCanvas) {
                const scale = data.scale / 100;
                const minDim = Math.min(data.fgCanvas.width, data.fgCanvas.height);
                const cropSize = minDim / scale;
                const srcX = (data.fgCanvas.width - cropSize) / 2 - (data.offsetX / CANVAS_SIZE) * cropSize;
                const srcY = (data.fgCanvas.height - cropSize) / 2 - (data.offsetY / CANVAS_SIZE) * cropSize;
                ctx.drawImage(data.fgCanvas, srcX, srcY, cropSize, cropSize, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
            }
        } else {
            if (activePlatform === 'windows') {
                ctx.save();
                ctx.beginPath();
                if (previewShape === 'circle') ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2);
                else if (previewShape === 'squircle') drawSquirclePath(ctx, 0, 0, CANVAS_SIZE, 0.225);
                else ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
                ctx.clip();
            }

            if (data.canvas) {
                const scale = data.scale / 100;
                const minDim = Math.min(data.canvas.width, data.canvas.height);
                const cropSize = minDim / scale;
                const srcX = (data.canvas.width - cropSize) / 2 - (data.offsetX / CANVAS_SIZE) * cropSize;
                const srcY = (data.canvas.height - cropSize) / 2 - (data.offsetY / CANVAS_SIZE) * cropSize;
                ctx.drawImage(data.canvas, srcX, srcY, cropSize, cropSize, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
            }

            if (activePlatform === 'windows') {
                ctx.restore();
            }
        }
        return tempCanvas;
    };

    const handleExport = async () => {
        if (!window.electron) {
            alert(t('alerts.exportDesktopOnly'));
            return;
        }
        const basePath = await window.electron.selectDirectory();
        if (!basePath) return; // User cancelled
        setIsExporting(true);

        try {
            const platform = PLATFORMS[activePlatform];
            const compositeCanvas = getCompositeCanvas();
            const files = [];

            if (activePlatform === 'apple') {
                // 1. MAS Icon (1024x1024 满铺正方形)
                files.push({
                    path: 'Apple/AppIcon_1024x1024.png',
                    data: canvasToBase64(compositeCanvas)
                });

                // 2. DMG Icon (824px Squircle + 投影)
                const dmgCanvas = document.createElement('canvas');
                dmgCanvas.width = CANVAS_SIZE; dmgCanvas.height = CANVAS_SIZE;
                const dCtx = dmgCanvas.getContext('2d');

                const bodySize = 824; // macOS 视觉修正区
                const pad = (CANVAS_SIZE - bodySize) / 2;

                // 投影效果
                dCtx.shadowColor = 'rgba(0, 0, 0, 0.35)';
                dCtx.shadowBlur = 40;
                dCtx.shadowOffsetY = 15;

                // Squircle 裁剪
                dCtx.save();
                dCtx.beginPath();
                drawSquirclePath(dCtx, pad, pad, bodySize, 0.225);
                dCtx.clip();

                // 绘制内容 (从源图的中心区域裁剪 824px)
                dCtx.drawImage(compositeCanvas, 0, 0, CANVAS_SIZE, CANVAS_SIZE, pad, pad, bodySize, bodySize);
                dCtx.restore();

                files.push({
                    path: 'Apple/DMG_Icon_1024x1024.png',
                    data: canvasToBase64(dmgCanvas)
                });
            } else {
                // 其他平台：单一导出
                const exportCanvas = resizeImage(compositeCanvas, platform.exportSize);
                files.push({
                    path: `${platform.name}/${platform.exportName}`,
                    data: canvasToBase64(exportCanvas)
                });
            }

            await window.electron.saveFiles({ basePath, files });

            if (activePlatform === 'apple') {
                alert(t('alerts.appleExportSuccess'));
            } else {
                alert(`${t('alerts.iconExportSuccess')}\n\n${platform.name}/${platform.exportName}\n${t('iconFabric.scale')}: ${platform.exportSize}×${platform.exportSize} px`);
            }
        } catch (error) {
            console.error(error);
            alert(t('alerts.exportFailed') + error.message);
        } finally {
            setIsExporting(false);
        }
    };

    // Listen for global export trigger from App.jsx
    useEffect(() => {
        const handleTrigger = () => {
            handleExport();
        };
        window.addEventListener('trigger-icon-export', handleTrigger);
        return () => window.removeEventListener('trigger-icon-export', handleTrigger);
    }, [activePlatform, platformData, previewShape]); // Dependencies needed for handleExport to have current state


    // === UI ===
    const platform = PLATFORMS[activePlatform];

    return (
        <div className="flex flex-1 overflow-hidden" style={{ background: 'var(--app-bg-primary)' }}>
            {/* 左侧：平台选择 + 控制 */}
            <div className="w-[300px] border-r flex flex-col shrink-0" style={{ background: 'var(--app-bg-primary)', borderColor: 'var(--app-border)' }}>
                <div className="flex p-2 gap-1 border-b border-gray-800">
                    {Object.values(PLATFORMS).map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActivePlatform(p.id)}
                            className={`flex-1 py-3 rounded-lg flex flex-col items-center gap-1 transition-all ${activePlatform === p.id
                                ? 'bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/50'
                                : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'}`}
                        >
                            <span className="text-xl">
                                {ICONS[p.id] && ICONS[p.id]({ className: `w-6 h-6 ${activePlatform === p.id ? 'fill-blue-400' : 'fill-gray-500 group-hover:fill-gray-300'}` })}
                            </span>
                            <span className="text-[10px] font-medium">{p.name}</span>
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5" /> {t('iconFabric.resourceLayers')}
                        </h3>

                        {activePlatform === 'android' ? (
                            <div className="space-y-3">
                                <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-300">{t('iconFabric.foreground')}</span>
                                        {platformData.android.foreground && <span className="text-[10px] text-green-400">{t('iconFabric.loaded')}</span>}
                                    </div>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-20 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 hover:bg-gray-700/30 transition-all"
                                    >
                                        {platformData.android.foreground ? (
                                            <img src={platformData.android.foreground} className="h-16 w-16 object-contain" />
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5 text-gray-500 mb-1" />
                                                <span className="text-[10px] text-gray-500">{t('iconFabric.uploadPng')}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-700/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-300">{t('iconFabric.background')}</span>
                                        <div className="flex bg-gray-900 rounded p-0.5">
                                            <button
                                                onClick={() => updatePlatformData('android', { backgroundType: 'color' })}
                                                className={`p-1 rounded ${platformData.android.backgroundType === 'color' ? 'bg-gray-700 text-white' : 'text-gray-500'}`}
                                            ><Palette className="w-3 h-3" /></button>
                                            <button
                                                onClick={() => updatePlatformData('android', { backgroundType: 'image' })}
                                                className={`p-1 rounded ${platformData.android.backgroundType === 'image' ? 'bg-gray-700 text-white' : 'text-gray-500'}`}
                                            ><ImageIcon className="w-3 h-3" /></button>
                                        </div>
                                    </div>

                                    {platformData.android.backgroundType === 'color' ? (
                                        <div className="flex gap-2 flex-wrap">
                                            {['#448AFF', '#00C853', '#FFD600', '#FF5252', '#FFFFFF', '#212121'].map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => updatePlatformData('android', { backgroundColor: color })}
                                                    className={`w-6 h-6 rounded-full border border-gray-600 ${platformData.android.backgroundColor === color ? 'ring-2 ring-white' : ''}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                            <input
                                                type="color"
                                                value={platformData.android.backgroundColor}
                                                onChange={e => updatePlatformData('android', { backgroundColor: e.target.value })}
                                                className="w-6 h-6 rounded-full overflow-hidden border-0 p-0"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => bgFileInputRef.current?.click()}
                                            className="h-16 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-500"
                                        >
                                            {platformData.android.backgroundImage ? (
                                                <img src={platformData.android.backgroundImage} className="w-full h-full object-cover rounded" />
                                            ) : (
                                                <span className="text-[10px] text-gray-500">{t('iconFabric.uploadBackground')}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-900/10 transition-all group"
                            >
                                {platformData[activePlatform].image ? (
                                    <img src={platformData[activePlatform].image} className="w-32 h-32 object-contain rounded-lg shadow-lg mb-2" />
                                ) : (
                                    <Upload className="w-8 h-8 text-gray-600 group-hover:text-blue-400 mb-2 transition-colors" />
                                )}
                                <span className="text-xs text-gray-500 group-hover:text-blue-300">
                                    {platformData[activePlatform].image ? '点击更换图片' : '上传源图片'}
                                </span>
                            </div>
                        )}

                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e.target.files[0], 'main')} />
                        <input ref={bgFileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e.target.files[0], 'background')} />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold text-gray-400 flex items-center gap-2">
                                <Move className="w-3.5 h-3.5" /> {t('iconFabric.transform')}
                            </h3>
                            <button onClick={resetSettings} className="text-[10px] text-blue-400 hover:text-blue-300">{t('iconFabric.reset')}</button>
                        </div>

                        <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
                            <div className="mb-4">
                                <div className="flex justify-between text-[11px] mb-1.5 text-gray-400">
                                    <span>{t('iconFabric.scale')}</span>
                                    <span className="text-white">{platformData[activePlatform].scale}%</span>
                                </div>
                                <input
                                    type="range" min="50" max="400" step="5"
                                    value={platformData[activePlatform].scale}
                                    onChange={e => updatePlatformData(activePlatform, { scale: parseInt(e.target.value), offsetX: 0, offsetY: 0 })}
                                    className="w-full h-1.5 bg-gray-700 rounded-lg accent-blue-500 cursor-pointer"
                                />
                            </div>

                            <div className="text-[10px] text-gray-500 flex items-start gap-2 bg-blue-500/5 p-2 rounded border border-blue-500/10">
                                <Move className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                                <span>{activePlatform === 'android' ? t('iconFabric.fgOnlyTip') : t('iconFabric.dragTip')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 中间：编辑器 */}
            <div className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--app-bg-secondary)' }}>
                <div className="h-10 flex items-center justify-center border-b border-gray-800/50">
                    <span className="text-xs text-gray-500">{platform.name} {t('iconFabric.editor')} · {t(`iconFabric.platforms.${activePlatform}.guide`)}</span>
                </div>
                <div className="flex-1 flex items-center justify-center overflow-hidden p-8">
                    <canvas
                        ref={editorCanvasRef}
                        onMouseDown={handleMouseDown}
                        className={`max-w-full max-h-full shadow-2xl rounded-lg ${platformData[activePlatform].scale > 100 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    />
                </div>
            </div>

            {/* 右侧：预览 + 导出 */}
            <div className="w-[340px] border-l flex flex-col shrink-0" style={{ background: 'var(--app-bg-primary)', borderColor: 'var(--app-border)' }}>
                <div className="p-4 border-b border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4 text-blue-400" /> {t('iconFabric.livePreview')}
                    </h3>
                </div>

                <div className="flex-1 p-6 flex flex-col items-center bg-gradient-to-b from-[#0F1115] to-[#000]">
                    {(activePlatform === 'android' || activePlatform === 'windows') && (
                        <div className="flex gap-2 mb-6 bg-gray-800/50 p-1 rounded-lg border border-gray-700">
                            {SHAPE_OPTS.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setPreviewShape(m.id)}
                                    title={t(`iconFabric.shapes.${m.id}`)}
                                    className={`w-8 h-8 flex items-center justify-center rounded ${previewShape === m.id ? 'bg-gray-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    <span className="text-lg leading-none">{m.icon}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <canvas ref={previewCanvasRef} className="w-[200px] h-[200px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]" />

                    <div className="mt-8 w-full">
                        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                            <h4 className="text-xs font-medium text-gray-400 mb-3">{t('iconFabric.exportFiles')}</h4>
                            {activePlatform === 'apple' ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                                        <div>
                                            <p className="text-sm text-white font-medium">AppIcon_1024x1024.png</p>
                                            <p className="text-[10px] text-gray-500">1024×1024 px · MAS 满铺</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                                        <div>
                                            <p className="text-sm text-white font-medium">DMG_Icon_1024x1024.png</p>
                                            <p className="text-[10px] text-gray-500">1024×1024 px · Squircle + 投影</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                                    <div>
                                        <p className="text-sm text-white font-medium">{platform.exportName}</p>
                                        <p className="text-[10px] text-gray-500">{platform.exportSize}×{platform.exportSize} px · PNG</p>
                                    </div>
                                </div>
                            )}
                            <p className="text-[10px] text-gray-600 mt-3 flex items-start gap-1.5">
                                <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                {t(`iconFabric.platforms.${activePlatform}.guide`)}
                            </p>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default IconFabric;
