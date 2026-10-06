# GlotShot 收费墙实施方案

> 本文档为 Codex 执行开发的完整指引。请严格按照文件清单和实施顺序执行。

## Context

GlotShot（苹果应用商店图片介绍设计网站）目前完全免费，没有任何付费机制。为实现商业化，需添加收费墙。

**策略**：首发抢占市场价 $29.99，终身买断。
**触发逻辑**：用户选择超过 1 种翻译语言时弹出收费墙，无需控制导出。
**参考实现**：智简 WitNote 笔记本的收费墙架构和 UI 设计。

---

## 一、收费墙触发逻辑

**触发点**：`src/App.jsx` 的 `toggleSecondaryLanguage()` 函数（约 line 3035）

**规则**：
- 免费用户：1 种翻译语言（primaryLang + 1 个 secondaryLang）
- Pro 用户：无限翻译语言

**实现方式**：在 `toggleSecondaryLanguage` 函数开头加入门控检查：

```javascript
const toggleSecondaryLanguage = (languageCode) => {
    const currentLangs = normalizeSecondaryLangs(
      globalSettings.primaryLang, globalSettings.secondaryLangs, globalSettings.secondaryLang
    );
    const isAdding = !currentLangs.includes(languageCode);

    // 免费用户已有 1 种翻译语言，尝试添加第 2 种时弹出收费墙
    if (isAdding && currentLangs.length >= 1 && !LicenseManager.isPro()) {
        setShowPaywall(true);
        return;
    }

    // 原有逻辑不变...
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
```

---

## 二、文件清单与实施顺序

### Phase 1：Electron 后端（许可证服务）

| 序号 | 操作 | 文件路径 | 说明 |
|------|------|----------|------|
| 1 | 修改 | `package.json` | 添加依赖 `"electron-store": "^8.1.0"` 并运行 `npm install` |
| 2 | 新建 | `src/shared/license.js` | 共享常量：`FREE_TRANSLATION_LIMIT`、`MAS_PRODUCT_ID` |
| 3 | 新建 | `electron/licenseService.cjs` | 改编自 WitNote 的 `electron/licenseService.ts`，CommonJS 格式 |
| 4 | 修改 | `electron/preload.cjs` | 暴露 `window.license` API |
| 5 | 修改 | `electron/main.cjs` | 添加 3 个 IPC handler |
| 6 | 修改 | `build/entitlements.mas.plist` | 添加 IAP 权限 |

### Phase 2：渲染进程许可证管理

| 序号 | 操作 | 文件路径 | 说明 |
|------|------|----------|------|
| 7 | 新建 | `src/services/LicenseManager.js` | 改编自 WitNote，纯 JS 版本 |

### Phase 3：收费墙 UI

| 序号 | 操作 | 文件路径 | 说明 |
|------|------|----------|------|
| 8 | 新建 | `src/components/PaywallDialog.jsx` | 收费墙弹窗组件 |
| 9 | 修改 | `src/App.css` | 添加收费墙样式 |

### Phase 4：集成与 i18n

| 序号 | 操作 | 文件路径 | 说明 |
|------|------|----------|------|
| 10 | 修改 | `src/locales/translations.js` | 12 种语言各添加 ~25 个 paywall key |
| 11 | 修改 | `src/App.jsx` | 添加 import、state、门控逻辑、渲染 PaywallDialog |

---

## 三、各文件详细实现规格

### 3.1 `src/shared/license.js`（新建）

```javascript
/**
 * GlotShot 许可证共享常量
 */

/** 免费用户最多可选的翻译语言数 */
export const FREE_TRANSLATION_LIMIT = 1;

/** Mac App Store 产品 ID */
export const MAS_PRODUCT_ID = 'com.maohuhu.glotshot.pro.lifetime';
```

---

### 3.2 `electron/licenseService.cjs`（新建）

改编自 WitNote 的 `智简witnote笔记本/electron/licenseService.ts`，转为 CommonJS 格式。

**核心设计**：
- **Product ID**: `com.maohuhu.glotshot.pro.lifetime`
- **存储**: `electron-store`，store name `'license'`
- **存储字段**: `proPurchased` (boolean)、`purchaseSource` (string|null)、`updatedAt` (string|null)
- **Provider 解析逻辑**:
  - `process.mas === true` → `'mas'`
  - `!app.isPackaged` → `'dev-stub'`
  - else → `'unsupported'`
- **交易监听**: `inAppPurchase.on('transactions-updated', ...)` 处理 purchased/restored/failed/deferred
- **导出**: `module.exports = { createLicenseService }`

**关键方法**：
```javascript
class LicenseService {
    constructor(options = {})           // 初始化 runtime, store, iap, provider
    getProvider()                       // 返回 'mas' | 'dev-stub' | 'unsupported'
    async checkStatus()                 // 返回 { isPro, source }
    async purchasePro()                 // 发起 MAS 购买，返回 { status, isPro, source, message? }
    async restorePurchases()            // 恢复购买，含超时处理 (10s)
    // private methods:
    resolveProvider()                   // 解析当前 provider
    ensureTransactionListener()         // 注册 transactions-updated 监听
    handleTransactionsUpdated(event, transactions)  // 处理交易状态变化
    persistPurchased(source)            // 写入 electron-store
    clearStoredPurchase()               // 清除存储
}
```

**完整参考**：直接参照 `智简witnote笔记本/electron/licenseService.ts` 的完整逻辑，仅做以下替换：
1. TypeScript → JavaScript (CommonJS)
2. `import` → `require`
3. Product ID → `com.maohuhu.glotshot.pro.lifetime`
4. 保留所有错误处理、超时、deferred 处理逻辑

---

### 3.3 `electron/main.cjs`（修改）

在文件顶部添加：
```javascript
const { createLicenseService } = require('./licenseService.cjs');
```

在 `app.whenReady()` 之后创建实例并注册 IPC：
```javascript
const licenseService = createLicenseService();

ipcMain.handle('license:check-status', () => licenseService.checkStatus());
ipcMain.handle('license:purchase-pro', () => licenseService.purchasePro());
ipcMain.handle('license:restore-purchases', () => licenseService.restorePurchases());
```

---

### 3.4 `electron/preload.cjs`（修改）

添加 `window.license` 命名空间（与现有 `window.electron` 并列）：

```javascript
contextBridge.exposeInMainWorld('license', {
    checkStatus: () => ipcRenderer.invoke('license:check-status'),
    purchasePro: () => ipcRenderer.invoke('license:purchase-pro'),
    restorePurchases: () => ipcRenderer.invoke('license:restore-purchases'),
});
```

---

### 3.5 `build/entitlements.mas.plist`（修改）

在现有 entitlements 中添加：
```xml
<key>com.apple.security.in-app-purchases</key>
<true/>
```

---

### 3.6 `src/services/LicenseManager.js`（新建）

改编自 WitNote 的 `智简witnote笔记本/src/services/LicenseManager.ts`，纯 JS 版本。

```javascript
import { FREE_TRANSLATION_LIMIT } from '../shared/license.js';

const LICENSE_CHANGE_EVENT = 'glotshot-license-change';

let cachedStatus = { isPro: false, source: 'unsupported' };

function emitLicenseChange(state) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(LICENSE_CHANGE_EVENT, { detail: state }));
}

function updateCachedStatus(nextStatus) {
    const shouldEmit = cachedStatus.isPro !== nextStatus.isPro;
    cachedStatus = nextStatus;
    if (shouldEmit) emitLicenseChange({ isPro: nextStatus.isPro });
}

export class LicenseManager {
    static async initialize() {
        if (typeof window === 'undefined' || !window.license?.checkStatus) return cachedStatus;
        try {
            const result = await window.license.checkStatus();
            updateCachedStatus(result);
            return result;
        } catch (error) {
            console.error('Failed to initialize license:', error);
            return cachedStatus;
        }
    }

    static isPro() { return cachedStatus.isPro; }
    static getState() { return { isPro: this.isPro() }; }
    static getProvider() { return cachedStatus.source; }

    static onChange(listener) {
        if (typeof window === 'undefined') return () => {};
        const handler = (event) => listener(event.detail || this.getState());
        window.addEventListener(LICENSE_CHANGE_EVENT, handler);
        return () => window.removeEventListener(LICENSE_CHANGE_EVENT, handler);
    }

    static async purchasePro() {
        if (!window.license?.purchasePro) {
            return { status: 'not_supported', isPro: false, source: cachedStatus.source };
        }
        try {
            const result = await window.license.purchasePro();
            updateCachedStatus({ isPro: result.isPro, source: result.source });
            return result;
        } catch (error) {
            console.error('Purchase failed:', error);
            return { status: 'failed', isPro: cachedStatus.isPro, source: cachedStatus.source, message: error.message };
        }
    }

    static async restorePurchases() {
        if (!window.license?.restorePurchases) {
            return { status: 'not_supported', isPro: false, source: cachedStatus.source };
        }
        try {
            const result = await window.license.restorePurchases();
            updateCachedStatus({ isPro: result.isPro, source: result.source });
            return result;
        } catch (error) {
            console.error('Restore failed:', error);
            return { status: 'failed', isPro: cachedStatus.isPro, source: cachedStatus.source, message: error.message };
        }
    }

    /** 检查翻译语言数是否超出免费限制 */
    static checkTranslationAccess(currentCount) {
        if (this.isPro() || currentCount < FREE_TRANSLATION_LIMIT) {
            return { allowed: true, requiresPro: false };
        }
        return { allowed: false, requiresPro: true };
    }

    // 仅供开发测试
    static setProStatus(enabled) {
        updateCachedStatus({ isPro: enabled, source: 'dev-stub' });
    }
}

export default LicenseManager;
```

---

### 3.7 `src/components/PaywallDialog.jsx`（新建）

参照 WitNote 的 `智简witnote笔记本/src/components/PaywallDialog.tsx`，适配 GlotShot。

**关键差异**：
- 使用 `useTranslation` from `'../locales/i18n'`（GlotShot 自定义 i18n，非 react-i18next）
- GlotShot 的 `t()` 函数签名：`t(key)` 返回翻译字符串，key 不存在时返回 key 本身
- 因此需要在 translations.js 中确保所有 key 都有值，无需 fallback 参数
- Props: `{ isOpen, onClose, onUnlock }` — 无 `feature` prop（只有一种付费功能）
- 权益列表改为 GlotShot 相关的 4 项

**组件结构**：

```jsx
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../locales/i18n';
import { X, Crown, Check } from 'lucide-react';
import { LicenseManager } from '../services/LicenseManager';

const BENEFITS = [
    { titleKey: 'paywall.benefitTranslationTitle', descKey: 'paywall.benefitTranslationDesc' },
    { titleKey: 'paywall.benefitBatchTitle', descKey: 'paywall.benefitBatchDesc' },
    { titleKey: 'paywall.benefitTimeTitle', descKey: 'paywall.benefitTimeDesc' },
    { titleKey: 'paywall.benefitFutureTitle', descKey: 'paywall.benefitFutureDesc' },
];

export default function PaywallDialog({ isOpen, onClose, onUnlock }) {
    const { t } = useTranslation();
    const [purchasing, setPurchasing] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [error, setError] = useState(null);

    // ESC 关闭 + body overflow 锁定（同 WitNote）
    useEffect(() => { ... }, [isOpen, onClose]);

    const handlePurchase = async () => { ... };  // 同 WitNote
    const handleRestore = async () => { ... };   // 同 WitNote

    if (!isOpen) return null;

    return createPortal(
        <div className="paywall-backdrop" onClick={onClose}>
            <div className="paywall-dialog" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="paywall-header">
                    <div className="paywall-brand">
                        <div className="paywall-brand-icon"><Crown size={20} /></div>
                        <div className="paywall-brand-copy">
                            <div className="paywall-kicker">{t('paywall.kicker')}</div>
                            <h3 className="paywall-title">{t('paywall.title')}</h3>
                        </div>
                    </div>
                    <button className="paywall-close" onClick={onClose}><X size={18} /></button>
                </div>

                {/* Subtitle */}
                <div className="paywall-hero">
                    <p className="paywall-subtitle">{t('paywall.subtitle')}</p>
                </div>

                {/* Price */}
                <div className="paywall-offer">
                    <div className="paywall-price-badge">{t('paywall.lifetimeBadge')}</div>
                    <div className="paywall-price-value">{t('paywall.priceValue')}</div>
                </div>

                {/* Benefits */}
                <div className="paywall-benefits">
                    {BENEFITS.map(b => (
                        <div className="paywall-benefit" key={b.titleKey}>
                            <span className="paywall-benefit-check"><Check size={11} /></span>
                            <div className="paywall-benefit-copy">
                                <div className="paywall-benefit-title">{t(b.titleKey)}</div>
                                <div className="paywall-benefit-desc">{t(b.descKey)}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && <div className="paywall-error">{error}</div>}

                {/* Actions */}
                <div className="paywall-actions">
                    <button className="paywall-secondary-btn" onClick={onClose} disabled={purchasing || restoring}>
                        {t('paywall.cancel')}
                    </button>
                    <button className="paywall-primary-btn" onClick={handlePurchase} disabled={purchasing || restoring}>
                        {purchasing ? t('paywall.purchasing') : t('paywall.unlockNow')}
                    </button>
                </div>

                {/* Restore Purchase (Apple 合规必须) */}
                <button className="paywall-restore-btn" onClick={handleRestore} disabled={purchasing || restoring}>
                    {restoring ? t('paywall.restoring') : t('paywall.restorePurchase')}
                </button>

                {/* CTA Note */}
                <div className="paywall-cta-note">{t('paywall.ctaNote')}</div>
            </div>
        </div>,
        document.body
    );
}
```

---

### 3.8 `src/App.css`（修改）

添加收费墙样式，支持 dark/light 两套主题。金色主题色：`#f6c453` / `#a86d00`。

```css
/* ===== Paywall Dialog ===== */
.paywall-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(6px);
}

.paywall-dialog {
    width: 400px;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
    background: var(--app-surface, #1a1a2e);
    border-radius: 16px;
    padding: 28px 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.paywall-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.paywall-brand {
    display: flex;
    align-items: center;
    gap: 12px;
}

.paywall-brand-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #f6c453, #a86d00);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
}

.paywall-kicker {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #f6c453;
    text-transform: uppercase;
}

.paywall-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--app-text, #fff);
    margin: 2px 0 0;
}

.paywall-close {
    background: none;
    border: none;
    color: var(--app-text-secondary, #888);
    cursor: pointer;
    padding: 4px;
    border-radius: 8px;
    transition: background 0.15s;
}
.paywall-close:hover {
    background: rgba(255, 255, 255, 0.08);
}

.paywall-subtitle {
    font-size: 14px;
    line-height: 1.5;
    color: var(--app-text-secondary, #aaa);
    margin: 0;
}

.paywall-offer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 14px;
    border-radius: 12px;
    background: rgba(246, 196, 83, 0.08);
    border: 1px solid rgba(246, 196, 83, 0.2);
}

.paywall-price-badge {
    font-size: 12px;
    font-weight: 600;
    color: #f6c453;
    padding: 4px 10px;
    border-radius: 20px;
    background: rgba(246, 196, 83, 0.15);
}

.paywall-price-value {
    font-size: 28px;
    font-weight: 800;
    color: var(--app-text, #fff);
}

.paywall-benefits {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.paywall-benefit {
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

.paywall-benefit-check {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(246, 196, 83, 0.15);
    color: #f6c453;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
}

.paywall-benefit-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--app-text, #fff);
}

.paywall-benefit-desc {
    font-size: 12px;
    color: var(--app-text-secondary, #aaa);
    line-height: 1.4;
}

.paywall-error {
    padding: 8px 14px;
    border-radius: 10px;
    background: rgba(220, 38, 38, 0.08);
    color: #dc2626;
    font-size: 13px;
    text-align: center;
}

.paywall-actions {
    display: flex;
    gap: 10px;
}

.paywall-secondary-btn {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: transparent;
    color: var(--app-text-secondary, #aaa);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
}
.paywall-secondary-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.05);
}

.paywall-primary-btn {
    flex: 2;
    padding: 12px;
    border-radius: 10px;
    border: none;
    background: linear-gradient(135deg, #f6c453, #d4a030);
    color: #1a1a2e;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.15s;
}
.paywall-primary-btn:hover:not(:disabled) {
    opacity: 0.9;
}
.paywall-primary-btn:disabled,
.paywall-secondary-btn:disabled {
    opacity: 0.5;
    cursor: default;
}

.paywall-restore-btn {
    background: none;
    border: none;
    color: var(--app-text-secondary, #888);
    font-size: 12px;
    cursor: pointer;
    text-decoration: underline;
    padding: 4px;
    align-self: center;
}
.paywall-restore-btn:disabled {
    opacity: 0.5;
    cursor: default;
}

.paywall-cta-note {
    font-size: 11px;
    color: var(--app-text-secondary, #777);
    text-align: center;
    line-height: 1.4;
}

/* Light theme overrides */
[data-theme="light"] .paywall-dialog {
    background: #fff;
    border-color: rgba(0, 0, 0, 0.08);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15);
}
[data-theme="light"] .paywall-close:hover {
    background: rgba(0, 0, 0, 0.05);
}
[data-theme="light"] .paywall-primary-btn {
    color: #fff;
    background: linear-gradient(135deg, #a86d00, #8b5a00);
}
[data-theme="light"] .paywall-secondary-btn {
    border-color: rgba(0, 0, 0, 0.12);
}
[data-theme="light"] .paywall-secondary-btn:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.03);
}
```

---

### 3.9 `src/App.jsx`（修改）

**共 4 处改动**：

#### 改动 A：顶部 import（约 line 7-11 附近）

```javascript
import PaywallDialog from './components/PaywallDialog';
import { LicenseManager } from './services/LicenseManager';
```

#### 改动 B：useState 区域（约 line 560 附近，其他 useState 之后）

```javascript
const [showPaywall, setShowPaywall] = useState(false);
const [isPro, setIsPro] = useState(false);

useEffect(() => {
    LicenseManager.initialize().then(() => {
        setIsPro(LicenseManager.isPro());
    });
    const unsub = LicenseManager.onChange((state) => setIsPro(state.isPro));
    return unsub;
}, []);
```

#### 改动 C：`toggleSecondaryLanguage` 函数（约 line 3035）

在函数开头添加门控（原有 `setGlobalSettings` 逻辑保持不变）：

```javascript
const toggleSecondaryLanguage = (languageCode) => {
    // === 新增：收费墙门控 ===
    const currentLangs = normalizeSecondaryLangs(
        globalSettings.primaryLang, globalSettings.secondaryLangs, globalSettings.secondaryLang
    );
    const isAdding = !currentLangs.includes(languageCode);
    if (isAdding && currentLangs.length >= 1 && !LicenseManager.isPro()) {
        setShowPaywall(true);
        return;
    }
    // === 门控结束 ===

    // 原有逻辑...
    setGlobalSettings(prev => {
        // ...
    });
};
```

#### 改动 D：JSX 末尾（约 line 5940，最后的 `</div>` 之前）

```jsx
<PaywallDialog
    isOpen={showPaywall}
    onClose={() => setShowPaywall(false)}
    onUnlock={async () => {
        const result = await LicenseManager.purchasePro();
        if (result.status === 'success') {
            setShowPaywall(false);
        }
        return result;
    }}
/>
```

---

### 3.10 `src/locales/translations.js`（修改）

在每种语言的对象中添加 `paywall` 块。以下是所有 12 种语言的完整文案：

#### English (en)

```javascript
paywall: {
    kicker: 'GLOTSHOT PRO',
    title: 'Unlock Multi-Language Power',
    subtitle: 'Create App Store screenshots in every language your app supports. One design, every market covered.',
    lifetimeBadge: 'Lifetime unlock',
    priceValue: '$29.99',
    benefitTranslationTitle: 'Unlimited translation languages',
    benefitTranslationDesc: 'Add as many languages as you need. Reach every market without limits.',
    benefitBatchTitle: 'Batch multi-language export',
    benefitBatchDesc: 'Export all languages at once. Save hours of manual screenshot work per release.',
    benefitTimeTitle: 'Ship faster, reach wider',
    benefitTimeDesc: 'Localize once, deploy everywhere. Cut days of screenshot creation to minutes.',
    benefitFutureTitle: 'All future Pro features included',
    benefitFutureDesc: 'Your one-time purchase covers every Pro feature we add, forever.',
    unlockNow: 'Upgrade to Pro',
    cancel: 'Cancel',
    purchasing: 'Purchasing...',
    purchaseFailed: 'Purchase failed. Please try again.',
    purchaseCancelled: 'Purchase was cancelled.',
    purchaseNotSupported: 'This build does not support purchases. Please use the Mac App Store version.',
    restorePurchase: 'Restore Purchase',
    restoring: 'Restoring...',
    restoreNotFound: 'No previous purchase found.',
    restoreFailed: 'Restore failed. Please try again.',
    restoreNotSupported: 'This build does not support purchase restore. Please use the Mac App Store version.',
    ctaNote: 'One-time payment. No subscription fees. Pro features stay unlocked permanently.',
},
```

#### Chinese Simplified (zh-CN)

```javascript
paywall: {
    kicker: 'GLOTSHOT PRO',
    title: '解锁多语言能力',
    subtitle: '为你的 App 创建每种语言的应用商店截图。一次设计，覆盖所有市场。',
    lifetimeBadge: '终身买断',
    priceValue: '$29.99',
    benefitTranslationTitle: '无限翻译语言',
    benefitTranslationDesc: '按需添加任意数量的语言，让你的应用覆盖每一个市场。',
    benefitBatchTitle: '批量多语言导出',
    benefitBatchDesc: '一键导出所有语言版本，每次发版省下数小时手动截图时间。',
    benefitTimeTitle: '更快上线，覆盖更广',
    benefitTimeDesc: '一次本地化，全球部署。将数天的截图制作缩短到几分钟。',
    benefitFutureTitle: '包含所有未来 Pro 功能',
    benefitFutureDesc: '一次购买，永久享有我们添加的每项 Pro 功能。',
    unlockNow: '升级到 Pro',
    cancel: '取消',
    purchasing: '正在购买...',
    purchaseFailed: '购买失败，请重试。',
    purchaseCancelled: '购买已取消。',
    purchaseNotSupported: '此版本不支持购买，请使用 Mac App Store 版本。',
    restorePurchase: '恢复购买',
    restoring: '正在恢复...',
    restoreNotFound: '未找到之前的购买记录。',
    restoreFailed: '恢复失败，请重试。',
    restoreNotSupported: '此版本不支持恢复购买，请使用 Mac App Store 版本。',
    ctaNote: '一次付费，无订阅费用。Pro 功能永久解锁。',
},
```

#### Chinese Traditional (zh-TW)

```javascript
paywall: {
    kicker: 'GLOTSHOT PRO',
    title: '解鎖多語言能力',
    subtitle: '為你的 App 建立每種語言的應用商店截圖。一次設計，覆蓋所有市場。',
    lifetimeBadge: '終身買斷',
    priceValue: '$29.99',
    benefitTranslationTitle: '無限翻譯語言',
    benefitTranslationDesc: '按需添加任意數量的語言，讓你的應用覆蓋每一個市場。',
    benefitBatchTitle: '批次多語言匯出',
    benefitBatchDesc: '一鍵匯出所有語言版本，每次發版省下數小時手動截圖時間。',
    benefitTimeTitle: '更快上線，覆蓋更廣',
    benefitTimeDesc: '一次本地化，全球部署。將數天的截圖製作縮短到幾分鐘。',
    benefitFutureTitle: '包含所有未來 Pro 功能',
    benefitFutureDesc: '一次購買，永久享有我們添加的每項 Pro 功能。',
    unlockNow: '升級到 Pro',
    cancel: '取消',
    purchasing: '正在購買...',
    purchaseFailed: '購買失敗，請重試。',
    purchaseCancelled: '購買已取消。',
    purchaseNotSupported: '此版本不支援購買，請使用 Mac App Store 版本。',
    restorePurchase: '恢復購買',
    restoring: '正在恢復...',
    restoreNotFound: '未找到之前的購買記錄。',
    restoreFailed: '恢復失敗，請重試。',
    restoreNotSupported: '此版本不支援恢復購買，請使用 Mac App Store 版本。',
    ctaNote: '一次付費，無訂閱費用。Pro 功能永久解鎖。',
},
```

#### Japanese (ja)

```javascript
paywall: {
    kicker: 'GLOTSHOT PRO',
    title: '多言語機能をアンロック',
    subtitle: 'アプリがサポートするすべての言語でApp Storeスクリーンショットを作成。一度のデザインで、すべての市場をカバー。',
    lifetimeBadge: '買い切り',
    priceValue: '$29.99',
    benefitTranslationTitle: '無制限の翻訳言語',
    benefitTranslationDesc: '必要なだけ言語を追加。制限なくすべての市場にリーチ。',
    benefitBatchTitle: '一括多言語エクスポート',
    benefitBatchDesc: 'すべての言語を一度にエクスポート。リリースごとに何時間もの手作業を削減。',
    benefitTimeTitle: 'より速く公開、より広くリーチ',
    benefitTimeDesc: '一度のローカライズで、あらゆる場所にデプロイ。数日のスクリーンショット作成を数分に。',
    benefitFutureTitle: '今後のすべてのPro機能を含む',
    benefitFutureDesc: '一度の購入で、今後追加されるすべてのPro機能を永久に利用可能。',
    unlockNow: 'Proにアップグレード',
    cancel: 'キャンセル',
    purchasing: '購入中...',
    purchaseFailed: '購入に失敗しました。もう一度お試しください。',
    purchaseCancelled: '購入がキャンセルされました。',
    purchaseNotSupported: 'このビルドは購入に対応していません。Mac App Store版をご利用ください。',
    restorePurchase: '購入を復元',
    restoring: '復元中...',
    restoreNotFound: '以前の購入記録が見つかりません。',
    restoreFailed: '復元に失敗しました。もう一度お試しください。',
    restoreNotSupported: 'このビルドは購入の復元に対応していません。Mac App Store版をご利用ください。',
    ctaNote: '一度の支払い。サブスクリプション料金なし。Pro機能は永久にアンロック。',
},
```

#### Korean (ko)

```javascript
paywall: {
    kicker: 'GLOTSHOT PRO',
    title: '다국어 기능 잠금 해제',
    subtitle: '앱이 지원하는 모든 언어로 App Store 스크린샷을 만드세요. 한 번의 디자인으로 모든 시장을 커버.',
    lifetimeBadge: '평생 이용권',
    priceValue: '$29.99',
    benefitTranslationTitle: '무제한 번역 언어',
    benefitTranslationDesc: '필요한 만큼 언어를 추가하세요. 제한 없이 모든 시장에 도달.',
    benefitBatchTitle: '일괄 다국어 내보내기',
    benefitBatchDesc: '모든 언어를 한 번에 내보내기. 릴리스마다 수시간의 수동 작업 절약.',
    benefitTimeTitle: '더 빠르게 출시, 더 넓게 도달',
    benefitTimeDesc: '한 번의 현지화로 전 세계에 배포. 며칠 걸리던 스크린샷 제작을 몇 분으로.',
    benefitFutureTitle: '향후 모든 Pro 기능 포함',
    benefitFutureDesc: '한 번의 구매로 향후 추가되는 모든 Pro 기능을 영구적으로 이용.',
    unlockNow: 'Pro로 업그레이드',
    cancel: '취소',
    purchasing: '구매 중...',
    purchaseFailed: '구매에 실패했습니다. 다시 시도해 주세요.',
    purchaseCancelled: '구매가 취소되었습니다.',
    purchaseNotSupported: '이 빌드는 구매를 지원하지 않습니다. Mac App Store 버전을 이용해 주세요.',
    restorePurchase: '구매 복원',
    restoring: '복원 중...',
    restoreNotFound: '이전 구매 기록을 찾을 수 없습니다.',
    restoreFailed: '복원에 실패했습니다. 다시 시도해 주세요.',
    restoreNotSupported: '이 빌드는 구매 복원을 지원하지 않습니다. Mac App Store 버전을 이용해 주세요.',
    ctaNote: '일회성 결제. 구독료 없음. Pro 기능이 영구적으로 잠금 해제됩니다.',
},
```

#### French (fr)

```javascript
paywall: {
    kicker: 'GLOTSHOT PRO',
    title: 'Libérez la puissance multilingue',
    subtitle: 'Créez des captures d\'App Store dans toutes les langues de votre app. Un seul design, tous les marchés couverts.',
    lifetimeBadge: 'Achat unique',
    priceValue: '29,99 $',
    benefitTranslationTitle: 'Langues de traduction illimitées',
    benefitTranslationDesc: 'Ajoutez autant de langues que nécessaire. Atteignez chaque marché sans limite.',
    benefitBatchTitle: 'Export multilingue par lot',
    benefitBatchDesc: 'Exportez toutes les langues en une fois. Économisez des heures de travail manuel par version.',
    benefitTimeTitle: 'Publiez plus vite, touchez plus large',
    benefitTimeDesc: 'Localisez une fois, déployez partout. Réduisez des jours de création à quelques minutes.',
    benefitFutureTitle: 'Toutes les futures fonctionnalités Pro incluses',
    benefitFutureDesc: 'Votre achat unique couvre chaque fonctionnalité Pro que nous ajouterons, pour toujours.',
    unlockNow: 'Passer à Pro',
    cancel: 'Annuler',
    purchasing: 'Achat en cours...',
    purchaseFailed: 'Échec de l\'achat. Veuillez réessayer.',
    purchaseCancelled: 'Achat annulé.',
    purchaseNotSupported: 'Cette version ne prend pas en charge les achats. Veuillez utiliser la version Mac App Store.',
    restorePurchase: 'Restaurer l\'achat',
    restoring: 'Restauration...',
    restoreNotFound: 'Aucun achat précédent trouvé.',
    restoreFailed: 'Échec de la restauration. Veuillez réessayer.',
    restoreNotSupported: 'Cette version ne prend pas en charge la restauration. Veuillez utiliser la version Mac App Store.',
    ctaNote: 'Paiement unique. Pas de frais d\'abonnement. Les fonctionnalités Pro restent déverrouillées de façon permanente.',
},
```

#### German (de)

```javascript
paywall: {
    kicker: 'GLOTSHOT PRO',
    title: 'Mehrsprachige Power freischalten',
    subtitle: 'Erstellen Sie App Store Screenshots in jeder Sprache, die Ihre App unterstützt. Ein Design, alle Märkte abgedeckt.',
    lifetimeBadge: 'Einmalkauf',
    priceValue: '29,99 $',
    benefitTranslationTitle: 'Unbegrenzte Übersetzungssprachen',
    benefitTranslationDesc: 'Fügen Sie so viele Sprachen hinzu, wie Sie benötigen. Erreichen Sie jeden Markt ohne Limits.',
    benefitBatchTitle: 'Mehrsprachiger Batch-Export',
    benefitBatchDesc: 'Exportieren Sie alle Sprachen auf einmal. Sparen Sie Stunden manueller Arbeit pro Release.',
    benefitTimeTitle: 'Schneller veröffentlichen, breiter erreichen',
    benefitTimeDesc: 'Einmal lokalisieren, überall bereitstellen. Reduzieren Sie Tage der Screenshot-Erstellung auf Minuten.',
    benefitFutureTitle: 'Alle zukünftigen Pro-Funktionen inklusive',
    benefitFutureDesc: 'Ihr einmaliger Kauf deckt jede Pro-Funktion ab, die wir hinzufügen – für immer.',
    unlockNow: 'Auf Pro upgraden',
    cancel: 'Abbrechen',
    purchasing: 'Kaufvorgang...',
    purchaseFailed: 'Kauf fehlgeschlagen. Bitte versuchen Sie es erneut.',
    purchaseCancelled: 'Kauf wurde abgebrochen.',
    purchaseNotSupported: 'Dieser Build unterstützt keine Käufe. Bitte verwenden Sie die Mac App Store Version.',
    restorePurchase: 'Kauf wiederherstellen',
    restoring: 'Wiederherstellung...',
    restoreNotFound: 'Kein früherer Kauf gefunden.',
    restoreFailed: 'Wiederherstellung fehlgeschlagen. Bitte versuchen Sie es erneut.',
    restoreNotSupported: 'Dieser Build unterstützt keine Wiederherstellung. Bitte verwenden Sie die Mac App Store Version.',
    ctaNote: 'Einmalige Zahlung. Keine Abogebühren. Pro-Funktionen bleiben dauerhaft freigeschaltet.',
},
```

#### Spanish (es)

```javascript
paywall: {
    kicker: 'GLOTSHOT PRO',
    title: 'Desbloquea el poder multilingüe',
    subtitle: 'Crea capturas de App Store en todos los idiomas que soporta tu app. Un diseño, todos los mercados cubiertos.',
    lifetimeBadge: 'Compra única',
    priceValue: '$29.99',
    benefitTranslationTitle: 'Idiomas de traducción ilimitados',
    benefitTranslationDesc: 'Añade tantos idiomas como necesites. Llega a cada mercado sin límites.',
    benefitBatchTitle: 'Exportación multilingüe por lotes',
    benefitBatchDesc: 'Exporta todos los idiomas de una vez. Ahorra horas de trabajo manual por lanzamiento.',
    benefitTimeTitle: 'Publica más rápido, llega más lejos',
    benefitTimeDesc: 'Localiza una vez, despliega en todas partes. Reduce días de creación a minutos.',
    benefitFutureTitle: 'Todas las futuras funciones Pro incluidas',
    benefitFutureDesc: 'Tu compra única cubre cada función Pro que añadamos, para siempre.',
    unlockNow: 'Actualizar a Pro',
    cancel: 'Cancelar',
    purchasing: 'Comprando...',
    purchaseFailed: 'Error en la compra. Por favor, inténtalo de nuevo.',
    purchaseCancelled: 'Compra cancelada.',
    purchaseNotSupported: 'Esta versión no soporta compras. Por favor, usa la versión de Mac App Store.',
    restorePurchase: 'Restaurar compra',
    restoring: 'Restaurando...',
    restoreNotFound: 'No se encontró ninguna compra anterior.',
    restoreFailed: 'Error en la restauración. Por favor, inténtalo de nuevo.',
    restoreNotSupported: 'Esta versión no soporta la restauración de compras. Por favor, usa la versión de Mac App Store.',
    ctaNote: 'Pago único. Sin cuotas de suscripción. Las funciones Pro se desbloquean de forma permanente.',
},
```

#### Portuguese (pt)

```javascript
paywall: {
    kicker: 'GLOTSHOT PRO',
    title: 'Desbloqueie o poder multilíngue',
    subtitle: 'Crie capturas da App Store em todos os idiomas que seu app suporta. Um design, todos os mercados cobertos.',
    lifetimeBadge: 'Compra única',
    priceValue: '$29.99',
    benefitTranslationTitle: 'Idiomas de tradução ilimitados',
    benefitTranslationDesc: 'Adicione quantos idiomas precisar. Alcance cada mercado sem limites.',
    benefitBatchTitle: 'Exportação multilíngue em lote',
    benefitBatchDesc: 'Exporte todos os idiomas de uma vez. Economize horas de trabalho manual por lançamento.',
    benefitTimeTitle: 'Lance mais rápido, alcance mais longe',
    benefitTimeDesc: 'Localize uma vez, implante em todos os lugares. Reduza dias de criação para minutos.',
    benefitFutureTitle: 'Todos os futuros recursos Pro incluídos',
    benefitFutureDesc: 'Sua compra única cobre cada recurso Pro que adicionarmos, para sempre.',
    unlockNow: 'Atualizar para Pro',
    cancel: 'Cancelar',
    purchasing: 'Comprando...',
    purchaseFailed: 'Falha na compra. Por favor, tente novamente.',
    purchaseCancelled: 'Compra cancelada.',
    purchaseNotSupported: 'Esta versão não suporta compras. Por favor, use a versão da Mac App Store.',
    restorePurchase: 'Restaurar compra',
    restoring: 'Restaurando...',
    restoreNotFound: 'Nenhuma compra anterior encontrada.',
    restoreFailed: 'Falha na restauração. Por favor, tente novamente.',
    restoreNotSupported: 'Esta versão não suporta restauração de compras. Por favor, use a versão da Mac App Store.',
    ctaNote: 'Pagamento único. Sem taxas de assinatura. Recursos Pro ficam desbloqueados permanentemente.',
},
```

#### Italian (it)

```javascript
paywall: {
    kicker: 'GLOTSHOT PRO',
    title: 'Sblocca la potenza multilingue',
    subtitle: 'Crea screenshot per l\'App Store in ogni lingua supportata dalla tua app. Un design, tutti i mercati coperti.',
    lifetimeBadge: 'Acquisto unico',
    priceValue: '$29.99',
    benefitTranslationTitle: 'Lingue di traduzione illimitate',
    benefitTranslationDesc: 'Aggiungi tutte le lingue di cui hai bisogno. Raggiungi ogni mercato senza limiti.',
    benefitBatchTitle: 'Esportazione multilingue in batch',
    benefitBatchDesc: 'Esporta tutte le lingue in una volta. Risparmia ore di lavoro manuale per ogni rilascio.',
    benefitTimeTitle: 'Pubblica più veloce, raggiungi più lontano',
    benefitTimeDesc: 'Localizza una volta, distribuisci ovunque. Riduci giorni di creazione a minuti.',
    benefitFutureTitle: 'Tutte le future funzionalità Pro incluse',
    benefitFutureDesc: 'Il tuo acquisto unico copre ogni funzionalità Pro che aggiungeremo, per sempre.',
    unlockNow: 'Passa a Pro',
    cancel: 'Annulla',
    purchasing: 'Acquisto in corso...',
    purchaseFailed: 'Acquisto fallito. Per favore riprova.',
    purchaseCancelled: 'Acquisto annullato.',
    purchaseNotSupported: 'Questa versione non supporta gli acquisti. Per favore usa la versione Mac App Store.',
    restorePurchase: 'Ripristina acquisto',
    restoring: 'Ripristino...',
    restoreNotFound: 'Nessun acquisto precedente trovato.',
    restoreFailed: 'Ripristino fallito. Per favore riprova.',
    restoreNotSupported: 'Questa versione non supporta il ripristino degli acquisti. Per favore usa la versione Mac App Store.',
    ctaNote: 'Pagamento unico. Nessun costo di abbonamento. Le funzionalità Pro restano sbloccate permanentemente.',
},
```

#### Russian (ru)

```javascript
paywall: {
    kicker: 'GLOTSHOT PRO',
    title: 'Разблокируйте мультиязычность',
    subtitle: 'Создавайте скриншоты для App Store на всех языках вашего приложения. Один дизайн — все рынки охвачены.',
    lifetimeBadge: 'Навсегда',
    priceValue: '$29.99',
    benefitTranslationTitle: 'Неограниченное количество языков перевода',
    benefitTranslationDesc: 'Добавляйте столько языков, сколько нужно. Охватывайте каждый рынок без ограничений.',
    benefitBatchTitle: 'Пакетный мультиязычный экспорт',
    benefitBatchDesc: 'Экспортируйте все языки за один раз. Экономьте часы ручной работы с каждым релизом.',
    benefitTimeTitle: 'Публикуйте быстрее, охватывайте больше',
    benefitTimeDesc: 'Локализуйте один раз, развёртывайте везде. Сократите дни создания скриншотов до минут.',
    benefitFutureTitle: 'Все будущие Pro-функции включены',
    benefitFutureDesc: 'Ваша разовая покупка покрывает каждую Pro-функцию, которую мы добавим, навсегда.',
    unlockNow: 'Перейти на Pro',
    cancel: 'Отмена',
    purchasing: 'Покупка...',
    purchaseFailed: 'Покупка не удалась. Пожалуйста, попробуйте снова.',
    purchaseCancelled: 'Покупка отменена.',
    purchaseNotSupported: 'Эта сборка не поддерживает покупки. Пожалуйста, используйте версию из Mac App Store.',
    restorePurchase: 'Восстановить покупку',
    restoring: 'Восстановление...',
    restoreNotFound: 'Предыдущая покупка не найдена.',
    restoreFailed: 'Восстановление не удалось. Пожалуйста, попробуйте снова.',
    restoreNotSupported: 'Эта сборка не поддерживает восстановление покупок. Пожалуйста, используйте версию из Mac App Store.',
    ctaNote: 'Разовый платёж. Без подписки. Pro-функции разблокированы навсегда.',
},
```

#### Arabic (ar)

```javascript
paywall: {
    kicker: 'GLOTSHOT PRO',
    title: 'افتح قوة اللغات المتعددة',
    subtitle: 'أنشئ لقطات شاشة لمتجر التطبيقات بكل لغة يدعمها تطبيقك. تصميم واحد يغطي جميع الأسواق.',
    lifetimeBadge: 'شراء لمرة واحدة',
    priceValue: '$29.99',
    benefitTranslationTitle: 'لغات ترجمة غير محدودة',
    benefitTranslationDesc: 'أضف أي عدد من اللغات تحتاجه. وصول لكل سوق بلا حدود.',
    benefitBatchTitle: 'تصدير متعدد اللغات دفعة واحدة',
    benefitBatchDesc: 'صدّر جميع اللغات مرة واحدة. وفّر ساعات من العمل اليدوي مع كل إصدار.',
    benefitTimeTitle: 'انشر أسرع، وصل أبعد',
    benefitTimeDesc: 'ترجم مرة واحدة، انشر في كل مكان. حوّل أيام إنشاء اللقطات إلى دقائق.',
    benefitFutureTitle: 'جميع ميزات Pro المستقبلية مضمّنة',
    benefitFutureDesc: 'شراؤك لمرة واحدة يغطي كل ميزة Pro نضيفها، إلى الأبد.',
    unlockNow: 'الترقية إلى Pro',
    cancel: 'إلغاء',
    purchasing: 'جاري الشراء...',
    purchaseFailed: 'فشل الشراء. يرجى المحاولة مرة أخرى.',
    purchaseCancelled: 'تم إلغاء الشراء.',
    purchaseNotSupported: 'هذا الإصدار لا يدعم الشراء. يرجى استخدام إصدار Mac App Store.',
    restorePurchase: 'استعادة الشراء',
    restoring: 'جاري الاستعادة...',
    restoreNotFound: 'لم يتم العثور على عملية شراء سابقة.',
    restoreFailed: 'فشلت الاستعادة. يرجى المحاولة مرة أخرى.',
    restoreNotSupported: 'هذا الإصدار لا يدعم استعادة المشتريات. يرجى استخدام إصدار Mac App Store.',
    ctaNote: 'دفعة واحدة. بدون رسوم اشتراك. ميزات Pro تبقى مفتوحة بشكل دائم.',
},
```

---

## 四、Apple 审核合规检查清单

- [ ] 无 "Android"、"Google Play"、"Samsung"、"Surface" 等竞品平台词汇
- [ ] 无 "Alpha"、"Beta"、"Test"、"Debug" 等测试相关词汇
- [ ] 包含 "Restore Purchase" 按钮（Guideline 3.1.1 强制要求）
- [ ] 价格明确标示，无误导性表述
- [ ] 未滥用 Apple 商标
- [ ] `build/entitlements.mas.plist` 包含 `com.apple.security.in-app-purchases`
- [ ] 沙盒环境下功能正常

---

## 五、验证方案

1. **开发环境测试**：`npm run electron:dev`
   - 确认免费用户选第 2 种翻译语言时弹出收费墙
   - 确认免费用户可以正常使用 1 种翻译语言
   - 确认收费墙所有按钮可点击
   - 确认 ESC 键和遮罩点击可关闭收费墙
2. **dev-stub 模式验证**：非 MAS 构建时 purchase 返回 `not_supported`，UI 正确显示提示
3. **多语言验证**：切换 12 种 UI 语言，确认收费墙文案均正确显示
4. **MAS 沙盒测试**：`npm run build:mas-dev` 构建后用 TestFlight 测试真实购买流程
5. **Apple 审核预检**：运行 `APP_STORE_CHECKLIST.md` 检查，确保无禁词

---

## 六、关键参考文件

| 用途 | 文件路径 |
|------|----------|
| WitNote 收费墙 UI（参考） | `智简witnote笔记本/src/components/PaywallDialog.tsx` |
| WitNote 许可管理（参考） | `智简witnote笔记本/src/services/LicenseManager.ts` |
| WitNote Electron 许可服务（参考） | `智简witnote笔记本/electron/licenseService.ts` |
| WitNote 共享类型（参考） | `智简witnote笔记本/src/shared/license.ts` |
| GlotShot 翻译切换逻辑 | `src/App.jsx` (line ~3035 `toggleSecondaryLanguage`) |
| GlotShot 自定义 i18n | `src/locales/i18n.jsx` |
| GlotShot 翻译字符串 | `src/locales/translations.js` |
| Apple 审核检查清单 | `docs/APP_STORE_CHECKLIST.md` |
| GlotShot Electron 主进程 | `electron/main.cjs` |
| GlotShot Preload | `electron/preload.cjs` |
