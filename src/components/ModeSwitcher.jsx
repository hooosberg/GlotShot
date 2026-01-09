import { Image, Palette } from 'lucide-react';

/**
 * 模式切换组件
 * 在"商店截图"和"图标工厂"两种模式之间切换
 */
const ModeSwitcher = ({ activeMode, onModeChange }) => {
    const modes = [
        {
            id: 'screenshot',
            label: '海报与截图',
            icon: Image,
            description: 'App Store 宣传图制作',
        },
        {
            id: 'icon',
            label: '图标工厂',
            icon: Palette,
            description: '多平台图标生成',
        },
    ];

    return (
        <div className="flex items-center gap-1 bg-gray-800/60 rounded-lg p-0.5 border border-gray-700/50">
            {modes.map((mode) => {
                const Icon = mode.icon;
                const isActive = activeMode === mode.id;

                return (
                    <button
                        key={mode.id}
                        onClick={() => onModeChange(mode.id)}
                        className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
              transition-all duration-200 ease-out
              ${isActive
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                            }
            `}
                        title={mode.description}
                    >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{mode.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default ModeSwitcher;
