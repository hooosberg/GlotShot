/**
 * GlotShot 多语言翻译文件
 * 支持12种语言：zh-CN, zh-TW, en, ja, ko, fr, de, es, pt, it, ru, ar
 * 
 * 注意：目前仅 zh-CN 和 en 包含完整翻译
 * 其他语言使用占位符，需后续补充翻译
 */

export const translations = {
    'zh-CN': {
        // 通用
        common: {
            cancel: '取消',
            save: '保存',
            delete: '删除',
            confirm: '确认',
            reset: '复位',
            loading: '加载中...',
            success: '成功',
            error: '错误',
            warning: '警告',
            import: '导入',
            export: '导出',
            close: '关闭',
        },

        // Header 区域
        header: {
            import: '导入',
            exportAll: '导出全部',
            exportIcon: '导出图标',
            settings: '设置',
        },

        // 侧边栏 - 背景设置
        sidebar: {
            background: '背景',
            gradient: '渐变',
            image: '图片',
            customBackgrounds: '自定义背景',
            addBackground: '添加背景',
            clearAll: '清除所有',
            globalBackground: '全局背景',
            imageCount: '({n} 张)',
            builtinBackgrounds: '内置背景图片',
            linkedBackgrounds: '已链接背景图片',
            linkBackgroundFolder: '链接背景文件夹',
            // 渐变名称
            gradients: {
                deepBlue: '深海蓝调',
                aurora: '极光紫',
                sunset: '日落橙',
                fresh: '清新绿',
                premium: '高级灰',
                plum: '梅子黄',
                sakura: '樱花粉',
                ocean: '海洋青',
                berry: '薯莉紫',
                mint: '薄荷凉',
                grayBlue: '灰蓝调',
                twilight: '暮光金',
            },
        },

        // 截图布局
        layout: {
            title: '截图布局',
            scale: '缩放',
            verticalPosition: '垂直位置 (Y)',
            horizontalPosition: '水平位置 (X)',
            screenshotShadow: '截图阴影',
        },

        // 文案翻译
        text: {
            title: '文案 & 翻译',
            alignment: '对齐方式',
            shadow: '阴影',
            stroke: '描边',
            strokeColor: '描边颜色',
            gradientControl: '文字渐变控制',
            fadePosition: '渐变位置',
            bottomOpacity: '底部透明度',
            font: '字体',
            color: '颜色',
            fontSize: '字体大小',
            reTranslate: '重新翻译',
            uppercase: '全部大写 (UPPERCASE)',
            primaryStyle: '样式',
            secondaryStyle: '样式',
        },

        // 场景管理
        scenes: {
            languageSettings: '语言设置',
            primaryLanguage: '主语言 (Primary)',
            translationLanguage: '翻译语言 (Secondary)',
            addScene: '添加场景',
            confirmDelete: '确认删除此场景?',
            defaultTitle: '智能续写，激发无限灵感',
            defaultTitleEN: 'Smart Continue, Infinite Inspiration',
            scene: '场景',
            sceneList: '截图列表',
            selectAll: '全选/取消全选',
            deleteSelected: '删除选中的 {n} 项',
            importScreenshots: '导入截图',
            unnamed: '未命名场景',
            emptyHint: '点击右上角按钮导入截图',
            followSystem: '跟随系统',
            noTranslationHint: '选择「不使用翻译」可仅导出单一语言版本',
        },

        // Ollama 连接
        ollama: {
            title: '本地 AI 翻译 (Ollama)',
            connect: '连接 Ollama',
            guideTitle: 'Ollama 本地翻译设置',
            guideDesc: 'Ollama 是一个本地运行的 AI 模型服务，可以帮助您快速翻译标题文案。',
            step1: '1. 下载并安装 Ollama',
            step2: '2. 打开终端，运行 ollama run qwen2.5:7b',
            step3: '3. 等待模型下载完成后，返回此应用',
            download: '下载 Ollama',
            downloadInstall: '下载并安装 Ollama',
            runApp: '运行安装好的应用',
            clickConnect: '点击上方"连接"按钮',
            connected: '已连接',
            disconnected: '未连接',
            recommended: '推荐使用 Ollama：',
            recommendedDesc: '本地运行，隐私安全，翻译效果更佳。如不想安装或设备不支持，您也可以手动输入翻译内容。',
            autoTranslateFilename: '导入时自动翻译文件名',
        },

        // 导出提示
        alerts: {
            exportDesktopOnly: '导出功能仅在 Electron 桌面应用中可用',
            exportedImages: '已导出 {count} 张图片',
            exportSuccess: '导出成功！',
            exportSuccessBilingual: '导出成功！\nExport Completed Successfully!',
            importing: '正在导入...',
            importComplete: '导入完成',
            androidPngRequired: '⚠️ Android 自适应图标前景必须使用透明 PNG 格式！',
            appleExportSuccess: '✅ Apple 图标导出成功！\n\n• AppIcon_1024x1024.png (MAS 满铺)\n• DMG_Icon_1024x1024.png (Squircle + 投影)',
            iconExportSuccess: '✅ 导出成功！',
            exportFailed: '导出失败: ',
            confirmApplyAll: '确定要将当前截图大小、位置和文字布局应用到所有场景吗？',
            confirmDeleteScenes: '确定要删除选中的 {n} 个场景吗？',
        },

        // 图标工厂
        iconFabric: {
            resourceLayers: '资源图层',
            foreground: '前景 (Logo)',
            loaded: '已加载',
            uploadPng: '上传透明 PNG',
            background: '背景层',
            uploadBackground: '上传背景图',
            transform: '变换调整',
            scale: '缩放',
            reset: '复位',
            fgOnlyTip: '仅缩放移动前景图层',
            dragTip: '可在右侧画布拖拽调整位置',
            livePreview: '实时预览',
            exportFiles: '导出文件',
            // 形状
            shapes: {
                circle: '圆形',
                squircle: '圆角矩形',
                square: '方形',
            },
            // 平台
            platforms: {
                apple: {
                    name: 'Apple',
                    desc: 'iOS / macOS App Store',
                    guide: '满铺不透明图标，Xcode 自动生成所有尺寸',
                },
                android: {
                    name: 'Android',
                    desc: 'Google Play Store',
                    guide: '核心规范：前景层必须为透明 PNG (镂空) 以透出背景，Play Console 自动裁圆角',
                },
                steam: {
                    name: 'Steam',
                    desc: 'Desktop Shortcut',
                    guide: '512px 透明 PNG，Steamworks 自动生成 ICO',
                },
                windows: {
                    name: 'Windows',
                    desc: 'Desktop Icon',
                    guide: '256px 透明 PNG，外部工具打包 ICO',
                },
            },
            editor: '编辑器',
        },

        // 设计提示
        designTips: {
            designTips: '设计提示',
            screenshotRequirements: '截图要求',
            officialRequirements: '官方要求',
        },

        // 设置模态框
        settings: {
            title: '设置',
            nav: {
                start: '启动',
                appearance: '外观',
                shortcuts: '快捷键',
                general: '通用',
                about: '关于',
            },
            modes: {
                poster_title: '商店海报设计',
                poster_subtitle: 'Store Poster Design',
                poster_desc: '专为 App Store 和 Google Play 打造的截图美化工具。',
                poster_feature1: '✨ 智能手机外壳套用',
                poster_feature2: '🎨 渐变背景与文字排版',
                poster_feature3: '🌍 多语言批量导出',
                poster_cta: '进入设计 →',
                icon_title: '多平台图标工厂',
                icon_subtitle: 'Multi-platform Icon Factory',
                icon_desc: '一键生成所有主流平台所需的图标尺寸。',
                icon_feature1: '📱 iOS / Android / Windows / Web',
                icon_feature2: '✂️ 自动裁切与圆角处理',
                icon_feature3: '🚀 快速批量导出',
                icon_cta: '进入工厂 →',
            },
            intro: {
                title: '关于 GlotShot',
                desc1: 'GlotShot 是一个专注于移动应用上架素材设计的工具集。无论你是需要制作精美的应用商店预览图，还是需要生成适配各个平台的应用图标，GlotShot 都能帮助你高效完成。',
                desc2: '选择上方的一个模块开始你的工作。你可以在任何时候通过右上角的设置按钮切换回这里。',
            },
            appearance: {
                theme_title: '主题模式',
                dark: '深色',
                light: '浅色',
                glass_effect: '毛玻璃效果',
                glass_desc: '开启后界面将呈现半透明模糊质感',
            },
            shortcuts: {
                title: '键盘快捷键',
                save: '保存/导出',
                settings: '打开设置',
                import: '导入图片',
                undo: '撤销',
                redo: '重做',
                copy: '复制',
                paste: '粘贴',
            },
            general: {
                language_title: '界面语言',
                language_auto: '跟随系统',
                export_title: '导出设置',
                export_path: '默认保存位置',
                export_placeholder: '留空使用系统默认下载目录',
                ollama_title: 'AI 翻译 (Ollama)',
                ollama_host: '服务地址',
                auto_translate: '自动翻译标题',
            },
            about: {
                title: '关于 GlotShot',
                description: '专为独立开发者打造的 App Store 截图与图标设计工具。',
                version: '版本',
                developer: '开发者',
                github: 'GitHub 仓库',
                email: '联系邮箱',
                star_title: '喜欢这个项目？',
                star_action: '去 GitHub 点个 Star ⭐️',
                features_title: '功能特色',
                feature_poster: '商店海报设计：智能套壳、渐变背景、多语言批量导出',
                feature_icon: '图标工厂：多平台规格支持、自动圆角裁切、即时预览',
                feature_license: '开源协议：MIT License',
                cta_desc: '您的支持是我们持续更新的动力！如果觉得好用，请帮忙点个 Star。',
            },
            actions: {
                save: '保存',
                cancel: '取消',
            },
        },

        // Electron 菜单
        menu: {
            about: '关于 GlotShot',
            settings: '设置...',
            file: '文件',
            importScreenshots: '导入截图...',
            exportAll: '导出全部...',
            edit: '编辑',
            undo: '撤销',
            redo: '重做',
            cut: '剪切',
            copy: '复制',
            paste: '粘贴',
            delete: '删除',
            selectAll: '全选',
            startSpeaking: '语音听写',
            stopSpeaking: '停止朗读',
            view: '视图',
            mode: '模式',
            posterDesign: '海报设计 (Poster Design)',
            iconDesign: '图标设计 (Icon Design)',
            window: '窗口',
            help: '帮助',
            visitGithub: '访问 GitHub 仓库',
            aboutDeveloper: '关于开发者 (hooosberg)',
        },

        // 右侧边栏
        rightPanel: {
            paramAdjust: '参数调整',
            applyToAll: '应用到所有',
            layoutPresets: '布局预设',
            newPresetName: '新预设名称...',
            sizePreset: '尺寸预设',
            applyToAllHint: '将当前的位置/大小设置应用到所有场景',
        },

        // 尺寸预设名称
        presets: {
            phoneScreenshot: '手机截图',
            tabletScreenshot: '平板截图',
            desktop: '桌面',
            steamScreenshot: 'Steam 截图',
            steamCapsule: 'Steam 主胶囊',
        },

        // 设计提示
        designTipsContent: {
            // Mac
            macScreenshot: 'macOS 应用截图',
            minSize: '最小尺寸',
            supportsLandscape: '支持横屏展示',
            // iPhone
            mustShowRealUIInApp: '必须展示真实应用界面（in-app screenshots）',
            mustShowRealUI: '必须展示真实应用界面',
            textOverlayNotExceed20: '文字叠加层建议不超过图片的 20%',
            textOverlayNotExceed20Short: '文字叠加层建议不超过 20%',
            canAddBackgroundElements: '可添加背景、设备边框等设计元素',
            canAddBackgroundShort: '可添加背景设计元素',
            designOneMainImage: '此处仅设计一张主图，App Store Connect 会自动缩放',
            compatibleOldModels: '兼容旧机型，规格同上',
            // iPad
            ipadPro13Latest: 'iPad Pro 13\" 最新尺寸',
            sameAsIPhoneSpecs: '规格同 iPhone 截图要求',
            ipadPro129SameSpecs: 'iPad Pro 12.9\"，规格同上',
            ipadPro11SameSpecs: 'iPad Pro 11\"，规格同上',
            // Google Play
            textNotExceed20: '文字说明不超过图片的 20%',
            atLeast4Screenshots: '需提供至少 4 张截图',
            continuousDesign: '可使用跨截图的连续设计',
            landscapeRatio: '16:10 横屏比例',
            sameAsPhone: '规格同手机截图',
            topBanner: '应用页顶部横幅，纯设计图',
            avoidEdges: '避免在边缘放置重要元素',
            noPromoInfo: '不要包含价格、排名等促销信息',
            noScreenshots: '不需要放置应用截图',
            // Windows
            recommended: '推荐尺寸',
            keepContentTop: '保持关键内容在上 2/3 区域',
            max10Screenshots: '支持最多 10 张截图',
            minRequired: '最小要求尺寸',
            hd4k: '高清 4K 支持',
            // Steam
            actualGameplay: '游戏内实际截图',
            ratio16by9: '16:9 横屏比例',
            showCoreGameplay: '展示核心玩法',
            mainBanner: '商店页面主横幅',
            showBrand: '纯设计图，展示游戏品牌',
            avoidSmallFont: '避免小字体',
        },

        // 字体名称
        fonts: {
            systemDefault: '系统默认',
            sourceHanSans: '思源黑体',
            pingfang: '苹方',
            sourceHanSerif: '思源宋体',
            stkaiti: '华文楷体',
        },

        // 平台类别
        categories: {
            apple: 'Apple',
            googlePlay: 'Google Play',
            windows: 'Windows',
            steam: 'Steam',
            custom: '自定义',
        },
    },

    'en': {
        common: {
            cancel: 'Cancel',
            save: 'Save',
            delete: 'Delete',
            confirm: 'Confirm',
            reset: 'Reset',
            loading: 'Loading...',
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            import: 'Import',
            export: 'Export',
            close: 'Close',
        },

        header: {
            import: 'Import',
            exportAll: 'Export All',
            exportIcon: 'Export Icon',
            settings: 'Settings',
        },

        sidebar: {
            background: 'Background',
            gradient: 'Gradient',
            image: 'Image',
            customBackgrounds: 'Custom Backgrounds',
            addBackground: 'Add Background',
            clearAll: 'Clear All',
            globalBackground: 'Global Background',
            imageCount: '({n} images)',
            builtinBackgrounds: 'Built-in Backgrounds',
            linkedBackgrounds: 'Linked Backgrounds',
            linkBackgroundFolder: 'Link Background Folder',
            gradients: {
                deepBlue: 'Deep Blue',
                aurora: 'Aurora Purple',
                sunset: 'Sunset Orange',
                fresh: 'Fresh Green',
                premium: 'Premium Gray',
                plum: 'Plum Yellow',
                sakura: 'Sakura Pink',
                ocean: 'Ocean Cyan',
                berry: 'Berry Purple',
                mint: 'Mint Cool',
                grayBlue: 'Gray Blue',
                twilight: 'Twilight Gold',
            },
        },

        layout: {
            title: 'Screenshot Layout',
            scale: 'Scale',
            verticalPosition: 'Vertical Position (Y)',
            horizontalPosition: 'Horizontal Position (X)',
            screenshotShadow: 'Screenshot Shadow',
        },

        text: {
            title: 'Copy & Translation',
            alignment: 'Alignment',
            shadow: 'Shadow',
            stroke: 'Stroke',
            strokeColor: 'Stroke Color',
            gradientControl: 'Text Gradient Control',
            fadePosition: 'Fade Position',
            bottomOpacity: 'Bottom Opacity',
            font: 'Font',
            color: 'Color',
            fontSize: 'Font Size',
            reTranslate: 'Re-translate',
            uppercase: 'UPPERCASE',
            primaryStyle: 'Style',
            secondaryStyle: 'Style',
        },

        scenes: {
            languageSettings: 'Language Settings',
            primaryLanguage: 'Primary Language',
            translationLanguage: 'Translation Language',
            addScene: 'Add Scene',
            confirmDelete: 'Confirm delete this scene?',
            defaultTitle: 'Smart Continue, Infinite Inspiration',
            defaultTitleEN: 'Smart Continue, Infinite Inspiration',
            scene: 'Scene',
            sceneList: 'Screenshot List',
            selectAll: 'Select All / Deselect All',
            deleteSelected: 'Delete {n} selected',
            importScreenshots: 'Import Screenshots',
            unnamed: 'Unnamed Scene',
            emptyHint: 'Click the button in the upper right to import screenshots',
            followSystem: 'Follow System',
            noTranslationHint: 'Select "No Translation" to export single language only',
        },

        ollama: {
            title: 'Local AI Translation (Ollama)',
            connect: 'Connect Ollama',
            guideTitle: 'Ollama Local Translation Setup',
            guideDesc: 'Ollama is a locally-run AI model service that helps you quickly translate title text.',
            step1: '1. Download and install Ollama',
            step2: '2. Open terminal, run ollama run qwen2.5:7b',
            step3: '3. Wait for the model to download, then return to this app',
            download: 'Download Ollama',
            downloadInstall: 'Download and install Ollama',
            runApp: 'Run the installed app',
            clickConnect: 'Click the "Connect" button above',
            connected: 'Connected',
            disconnected: 'Disconnected',
            recommended: 'Recommended: Ollama',
            recommendedDesc: 'Runs locally for privacy and better translation quality. You can also manually enter translations if you prefer not to install it.',
            autoTranslateFilename: 'Auto-translate filenames on import',
        },

        alerts: {
            exportDesktopOnly: 'Export is only available in the Electron desktop app',
            exportedImages: 'Exported {count} images',
            exportSuccess: 'Export successful!',
            exportSuccessBilingual: 'Export successful!\nExport Completed Successfully!',
            importing: 'Importing...',
            importComplete: 'Import complete',
            androidPngRequired: '⚠️ Android adaptive icon foreground must use transparent PNG format!',
            appleExportSuccess: '✅ Apple icon exported successfully!\n\n• AppIcon_1024x1024.png (MAS full)\n• DMG_Icon_1024x1024.png (Squircle + shadow)',
            iconExportSuccess: '✅ Export successful!',
            exportFailed: 'Export failed: ',
            confirmApplyAll: 'Apply current screenshot size, position, and text layout to all scenes?',
            confirmDeleteScenes: 'Delete {n} selected scenes?',
        },

        iconFabric: {
            resourceLayers: 'Resource Layers',
            foreground: 'Foreground (Logo)',
            loaded: 'Loaded',
            uploadPng: 'Upload transparent PNG',
            background: 'Background Layer',
            uploadBackground: 'Upload background image',
            transform: 'Transform',
            scale: 'Scale',
            reset: 'Reset',
            fgOnlyTip: 'Only scales/moves foreground layer',
            dragTip: 'Drag on the canvas to adjust position',
            livePreview: 'Live Preview',
            exportFiles: 'Export Files',
            shapes: {
                circle: 'Circle',
                squircle: 'Rounded Square',
                square: 'Square',
            },
            platforms: {
                apple: {
                    name: 'Apple',
                    desc: 'iOS / macOS App Store',
                    guide: 'Full-bleed opaque icon, Xcode auto-generates all sizes',
                },
                android: {
                    name: 'Android',
                    desc: 'Google Play Store',
                    guide: 'Core spec: Foreground layer must be transparent PNG (cutout) to show background, Play Console auto-crops corners',
                },
                steam: {
                    name: 'Steam',
                    desc: 'Desktop Shortcut',
                    guide: '512px transparent PNG, Steamworks auto-generates ICO',
                },
                windows: {
                    name: 'Windows',
                    desc: 'Desktop Icon',
                    guide: '256px transparent PNG, external tool packages ICO',
                },
            },
            editor: 'Editor',
        },

        designTips: {
            designTips: 'Design Tips',
            screenshotRequirements: 'Screenshot Requirements',
            officialRequirements: 'Official Requirements',
        },

        settings: {
            title: 'Settings',
            nav: {
                start: 'Start',
                appearance: 'Appearance',
                shortcuts: 'Shortcuts',
                general: 'General',
                about: 'About',
            },
            modes: {
                poster_title: 'Store Poster Design',
                poster_subtitle: 'Store Poster Design',
                poster_desc: 'Screenshot beautification tool designed for App Store and Google Play.',
                poster_feature1: '✨ Smart device frame overlay',
                poster_feature2: '🎨 Gradient backgrounds & text layout',
                poster_feature3: '🌍 Multi-language batch export',
                poster_cta: 'Start Designing →',
                icon_title: 'Multi-platform Icon Factory',
                icon_subtitle: 'Multi-platform Icon Factory',
                icon_desc: 'Generate all required icon sizes for major platforms with one click.',
                icon_feature1: '📱 iOS / Android / Windows / Web',
                icon_feature2: '✂️ Auto crop & corner rounding',
                icon_feature3: '🚀 Fast batch export',
                icon_cta: 'Enter Factory →',
            },
            intro: {
                title: 'About GlotShot',
                desc1: 'GlotShot is a toolkit focused on mobile app store asset design. Whether you need to create beautiful app store previews or generate app icons for various platforms, GlotShot helps you complete the task efficiently.',
                desc2: 'Select a module above to start your work. You can return here anytime via the settings button in the top right.',
            },
            appearance: {
                theme_title: 'Theme & Style',
                dark: 'Dark',
                light: 'Light',
                glass_effect: 'Frosted Glass',
                glass_desc: 'Enable semi-transparent background blur',
            },
            shortcuts: {
                title: 'Keyboard Shortcuts',
                save: 'Save / Export',
                settings: 'Open Settings',
                import: 'Import Image',
                undo: 'Undo',
                redo: 'Redo',
                copy: 'Copy',
                paste: 'Paste',
            },
            general: {
                language_title: 'Interface Language',
                language_auto: 'Follow System',
                export_title: 'Export Settings',
                export_path: 'Default Save Path',
                export_placeholder: 'Empty for default download folder',
                ollama_title: 'AI Translation (Ollama)',
                ollama_host: 'Server Host',
                auto_translate: 'Auto Translate Titles',
            },
            about: {
                title: 'About GlotShot',
                description: 'Professional App Store screenshot and icon design tool for indie developers.',
                version: 'Version',
                developer: 'Developer',
                github: 'GitHub Repository',
                email: 'Contact Email',
                star_title: 'Like this project?',
                star_action: 'Star on GitHub ⭐️',
                features_title: 'Features',
                feature_poster: 'Store Poster: Smart frames, gradients, batch export',
                feature_icon: 'Icon Factory: Multi-platform support, auto resizing',
                feature_license: 'License: MIT Open Source License',
                cta_desc: 'Your support keeps us going! Please star us on GitHub.',
            },
            actions: {
                save: 'Save',
                cancel: 'Cancel',
            },
        },

        menu: {
            about: 'About GlotShot',
            settings: 'Settings...',
            file: 'File',
            importScreenshots: 'Import Screenshots...',
            exportAll: 'Export All...',
            edit: 'Edit',
            undo: 'Undo',
            redo: 'Redo',
            cut: 'Cut',
            copy: 'Copy',
            paste: 'Paste',
            delete: 'Delete',
            selectAll: 'Select All',
            startSpeaking: 'Start Dictation',
            stopSpeaking: 'Stop Speaking',
            view: 'View',
            mode: 'Mode',
            posterDesign: 'Poster Design',
            iconDesign: 'Icon Design',
            window: 'Window',
            help: 'Help',
            visitGithub: 'Visit GitHub Repository',
            aboutDeveloper: 'About Developer (hooosberg)',
        },

        rightPanel: {
            paramAdjust: 'Parameters',
            applyToAll: 'Apply to All',
            layoutPresets: 'Layout Presets',
            newPresetName: 'New preset name...',
            sizePreset: 'Size Preset',
            applyToAllHint: 'Apply current position/size settings to all scenes',
        },

        // Size preset names
        presets: {
            phoneScreenshot: 'Phone Screenshot',
            tabletScreenshot: 'Tablet Screenshot',
            desktop: 'Desktop',
            steamScreenshot: 'Steam Screenshot',
            steamCapsule: 'Steam Capsule',
        },

        // Design tips content
        designTipsContent: {
            // Mac
            macScreenshot: 'macOS App Screenshot',
            minSize: 'Minimum Size',
            supportsLandscape: 'Supports Landscape',
            // iPhone
            mustShowRealUIInApp: 'Must show real app interface (in-app screenshots)',
            mustShowRealUI: 'Must show real app interface',
            textOverlayNotExceed20: 'Text overlay should not exceed 20% of image',
            textOverlayNotExceed20Short: 'Text overlay should not exceed 20%',
            canAddBackgroundElements: 'Can add background, device frames and design elements',
            canAddBackgroundShort: 'Can add background design elements',
            designOneMainImage: 'Design one main image, App Store Connect will auto-scale',
            compatibleOldModels: 'Compatible with older models, same specs',
            // iPad
            ipadPro13Latest: 'iPad Pro 13" latest size',
            sameAsIPhoneSpecs: 'Same specs as iPhone screenshot',
            ipadPro129SameSpecs: 'iPad Pro 12.9", same specs',
            ipadPro11SameSpecs: 'iPad Pro 11", same specs',
            // Google Play
            textNotExceed20: 'Text should not exceed 20% of image',
            atLeast4Screenshots: 'At least 4 screenshots required',
            continuousDesign: 'Cross-screenshot continuous design supported',
            landscapeRatio: '16:10 Landscape Ratio',
            sameAsPhone: 'Same specs as phone screenshot',
            topBanner: 'Top banner for app page, design only',
            avoidEdges: 'Avoid placing important elements at edges',
            noPromoInfo: 'No pricing, ranking or promotional info',
            noScreenshots: 'No app screenshots needed',
            // Windows
            recommended: 'Recommended Size',
            keepContentTop: 'Keep key content in top 2/3 area',
            max10Screenshots: 'Up to 10 screenshots supported',
            minRequired: 'Minimum required size',
            hd4k: 'HD 4K support',
            // Steam
            actualGameplay: 'Actual in-game screenshot',
            ratio16by9: '16:9 Landscape Ratio',
            showCoreGameplay: 'Show core gameplay',
            mainBanner: 'Store page main banner',
            showBrand: 'Design only, showcase game brand',
            avoidSmallFont: 'Avoid small fonts',
        },

        // Font names
        fonts: {
            systemDefault: 'System Default',
            sourceHanSans: 'Source Han Sans',
            pingfang: 'PingFang',
            sourceHanSerif: 'Source Han Serif',
            stkaiti: 'STKaiti',
        },

        categories: {
            apple: 'Apple',
            googlePlay: 'Google Play',
            windows: 'Windows',
            steam: 'Steam',
            custom: 'Custom',
        },
    },

    // 以下语言使用占位符，需后续翻译
    // 暂时复制英文结构，翻译内容待补充
    'zh-TW': null, // 将回退到 zh-CN
    'ja': null,
    'ko': null,
    'fr': null,
    'de': null,
    'es': null,
    'pt': null,
    'it': null,
    'ru': null,
    'ar': null,
};

// 为未翻译的语言提供回退
Object.keys(translations).forEach(lang => {
    if (translations[lang] === null) {
        // 对于繁体中文，回退到简体中文；其他语言回退到英文
        translations[lang] = lang === 'zh-TW' ? translations['zh-CN'] : translations['en'];
    }
});
