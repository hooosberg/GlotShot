/**
 * 图像处理工具函数
 * 提供图标生成所需的各种图像处理功能
 */

/**
 * 加载图片并返回 Promise
 * @param {string} src - 图片路径或 base64
 * @returns {Promise<HTMLImageElement>}
 */
export const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
};

/**
 * 创建指定尺寸的 Canvas
 * @param {number} width
 * @param {number} height
 * @returns {{ canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D }}
 */
export const createCanvas = (width, height = width) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    return { canvas, ctx };
};

/**
 * 缩放图片到指定尺寸
 * @param {HTMLImageElement} image - 源图片
 * @param {number} targetSize - 目标尺寸（正方形）
 * @returns {HTMLCanvasElement}
 */
export const resizeImage = (image, targetSize) => {
    const { canvas, ctx } = createCanvas(targetSize);
    ctx.drawImage(image, 0, 0, targetSize, targetSize);
    return canvas;
};

/**
 * 应用 macOS 视觉校正
 * 将图标主体缩小并居中，添加阴影效果
 * @param {HTMLCanvasElement} sourceCanvas - 源画布
 * @param {Object} options - 配置选项
 * @returns {HTMLCanvasElement}
 */
export const applyMacOSVisualCorrection = (sourceCanvas, options = {}) => {
    const {
        contentScale = 0.82,
        applyDropShadow = true,
        shadowColor = 'rgba(0, 0, 0, 0.25)',
        shadowBlur = 40,
        shadowOffsetX = 0,
        shadowOffsetY = 8,
    } = options;

    const size = sourceCanvas.width;
    const { canvas, ctx } = createCanvas(size);

    // 透明背景
    ctx.clearRect(0, 0, size, size);

    // 计算缩放后的尺寸和偏移
    const scaledSize = size * contentScale;
    const offset = (size - scaledSize) / 2;

    // 应用阴影
    if (applyDropShadow) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;
    }

    // 绘制缩放后的图标
    ctx.drawImage(sourceCanvas, offset, offset, scaledSize, scaledSize);

    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    return canvas;
};

/**
 * 绘制 Apple 风格 Squircle (超椭圆) 路径
 * 用于 macOS Big Sur 及以后的图标圆角
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - 起始 X 坐标
 * @param {number} y - 起始 Y 坐标
 * @param {number} size - 尺寸
 * @param {number} radiusRatio - 圆角比例 (0-0.5)
 */
export const drawSquirclePath = (ctx, x, y, size, radiusRatio = 0.225) => {
    const r = radiusRatio * size;
    const s = size;

    // 贝塞尔曲线控制点系数
    const k = 0.55228474983; // 4/3 * (sqrt(2) - 1)

    ctx.beginPath();
    ctx.moveTo(x + r, y);

    // 右上角
    ctx.lineTo(x + s - r, y);
    ctx.bezierCurveTo(
        x + s - r * (1 - k), y,
        x + s, y + r * (1 - k),
        x + s, y + r
    );

    // 右下角
    ctx.lineTo(x + s, y + s - r);
    ctx.bezierCurveTo(
        x + s, y + s - r * (1 - k),
        x + s - r * (1 - k), y + s,
        x + s - r, y + s
    );

    // 左下角
    ctx.lineTo(x + r, y + s);
    ctx.bezierCurveTo(
        x + r * (1 - k), y + s,
        x, y + s - r * (1 - k),
        x, y + s - r
    );

    // 左上角
    ctx.lineTo(x, y + r);
    ctx.bezierCurveTo(
        x, y + r * (1 - k),
        x + r * (1 - k), y,
        x + r, y
    );

    ctx.closePath();
};

/**
 * 应用 Squircle 遮罩裁剪
 * @param {HTMLCanvasElement} sourceCanvas
 * @param {number} radiusRatio - 圆角比例
 * @returns {HTMLCanvasElement}
 */
export const applySquircleMask = (sourceCanvas, radiusRatio = 0.225) => {
    const size = sourceCanvas.width;
    const { canvas, ctx } = createCanvas(size);

    // 绘制 Squircle 路径作为裁剪区域
    drawSquirclePath(ctx, 0, 0, size, radiusRatio);
    ctx.clip();

    // 在裁剪区域内绘制图像
    ctx.drawImage(sourceCanvas, 0, 0);

    return canvas;
};

/**
 * 应用圆形遮罩（用于 Android 预览）
 * @param {HTMLCanvasElement} sourceCanvas
 * @returns {HTMLCanvasElement}
 */
export const applyCircleMask = (sourceCanvas) => {
    const size = sourceCanvas.width;
    const { canvas, ctx } = createCanvas(size);

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(sourceCanvas, 0, 0);

    return canvas;
};

/**
 * 应用圆角矩形遮罩（用于 Android 预览）
 * @param {HTMLCanvasElement} sourceCanvas
 * @param {number} radiusRatio - 圆角比例
 * @returns {HTMLCanvasElement}
 */
export const applyRoundedRectMask = (sourceCanvas, radiusRatio = 0.15) => {
    const size = sourceCanvas.width;
    const radius = size * radiusRatio;
    const { canvas, ctx } = createCanvas(size);

    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, radius);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(sourceCanvas, 0, 0);

    return canvas;
};

/**
 * 居中裁剪图片到正方形
 * @param {HTMLImageElement} image
 * @param {number} outputSize - 输出尺寸
 * @returns {HTMLCanvasElement}
 */
export const centerCropToSquare = (image, outputSize = 1024) => {
    const { canvas, ctx } = createCanvas(outputSize);

    const minDim = Math.min(image.width, image.height);
    const sx = (image.width - minDim) / 2;
    const sy = (image.height - minDim) / 2;

    ctx.drawImage(image, sx, sy, minDim, minDim, 0, 0, outputSize, outputSize);

    return canvas;
};

/**
 * Canvas 转 Base64
 * @param {HTMLCanvasElement} canvas
 * @param {string} format - 'png' | 'jpeg'
 * @param {number} quality - 质量 (0-1)
 * @returns {string}
 */
export const canvasToBase64 = (canvas, format = 'png', quality = 0.92) => {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    return canvas.toDataURL(mimeType, quality);
};

/**
 * Canvas 转 Blob
 * @param {HTMLCanvasElement} canvas
 * @param {string} format
 * @param {number} quality
 * @returns {Promise<Blob>}
 */
export const canvasToBlob = (canvas, format = 'png', quality = 0.92) => {
    return new Promise((resolve) => {
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        canvas.toBlob(resolve, mimeType, quality);
    });
};
