import { AlertCircle, Info, Lightbulb } from 'lucide-react';

/**
 * 设计说明组件
 * 在预览区上方显示官方要求和注意事项
 */
const DesignTips = ({ tips, mode, className = '' }) => {
    if (!tips?.length) return null;

    const isScreenshotMode = mode === 'screenshot';
    const bgColor = isScreenshotMode
        ? 'bg-blue-900/20 border-blue-700/30'
        : 'bg-amber-900/20 border-amber-700/30';
    const iconColor = isScreenshotMode ? 'text-blue-400' : 'text-amber-400';
    const bulletColor = isScreenshotMode ? 'text-blue-500/60' : 'text-amber-500/60';

    return (
        <div className={`${bgColor} border rounded-lg p-3 ${className}`}>
            <div className="flex items-center gap-2 mb-2">
                {isScreenshotMode ? (
                    <Info className={`w-4 h-4 ${iconColor}`} />
                ) : (
                    <Lightbulb className={`w-4 h-4 ${iconColor}`} />
                )}
                <span className={`text-xs font-medium ${iconColor}`}>
                    {mode === 'poster' ? '设计提示' : mode === 'screenshot' ? '截图要求' : '官方要求'}
                </span>
            </div>
            <ul className="text-xs text-gray-400 space-y-1.5">
                {tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <span className={`${bulletColor} mt-0.5`}>•</span>
                        <span>{tip}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DesignTips;
