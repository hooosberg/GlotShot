import { AlertCircle, Info, Lightbulb } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '../locales/i18n';

/**
 * 设计说明组件
 * 在预览区上方显示官方要求和注意事项
 */
const DesignTips = ({ tips, mode, className = '' }) => {
    if (!tips?.length) return null;

    const [isExpanded, setIsExpanded] = useState(true);
    const { t } = useTranslation();

    // 每次切换模式或提示内容变化时，重置为展开状态，并在3秒后收起
    // Use tips content string instead of array reference to prevent constant re-triggers
    const tipsKey = tips?.join(',') || '';
    useEffect(() => {
        setIsExpanded(true);
        const timer = setTimeout(() => {
            setIsExpanded(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, [mode, tipsKey]);

    const isScreenshotMode = mode === 'screenshot';
    // 使用透明毛玻璃背景，悬浮在预览区上方
    const bgColor = isScreenshotMode
        ? 'bg-blue-500/10 border-blue-500/20 backdrop-blur-md'
        : 'bg-amber-500/10 border-amber-500/20 backdrop-blur-md';
    const iconColor = isScreenshotMode ? 'text-blue-400' : 'text-amber-400';
    const bulletColor = isScreenshotMode ? 'text-blue-500/60' : 'text-amber-500/60';

    // 根据模式获取对应的标题文本
    const getTipLabel = () => {
        if (mode === 'poster') return t('designTips.designTips');
        if (mode === 'screenshot') return t('designTips.screenshotRequirements');
        return t('designTips.officialRequirements');
    };

    return (
        <div
            className={`
                ${bgColor} border rounded-lg shadow-lg ${className}
                transition-all duration-300 ease-in-out
                ${isExpanded ? 'p-3' : 'p-2 w-8 h-8'}
            `}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className={`flex items-center gap-2 ${isExpanded ? 'mb-2' : ''}`}>
                {isScreenshotMode ? (
                    <Info className={`w-4 h-4 ${iconColor}`} />
                ) : (
                    <Lightbulb className={`w-4 h-4 ${iconColor}`} />
                )}
                {isExpanded && (
                    <span className={`text-xs font-medium ${iconColor} whitespace-nowrap ml-1`}>
                        {getTipLabel()}
                    </span>
                )}
            </div>

            <div className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
            `}>
                <ul className="text-xs text-gray-400 space-y-1.5">
                    {tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 whitespace-nowrap">
                            <span className={`${bulletColor} mt-0.5`}>•</span>
                            <span>{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DesignTips;
