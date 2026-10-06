/**
 * GlotShot 许可证共享常量
 */

/** 免费用户最多可选的翻译语言数 */
export const FREE_TRANSLATION_LIMIT = 1;

/** Mac App Store 产品 ID */
export const MAS_PRODUCT_ID = 'com.maohuhu.glotshot.pro.lifetime';

/**
 * @typedef {'mas' | 'dev-stub' | 'unsupported'} LicenseProvider
 * @typedef {'success' | 'failed' | 'cancelled' | 'not_supported' | 'not_found'} LicenseActionStatus
 *
 * @typedef {Object} LicenseStatusResult
 * @property {boolean} isPro
 * @property {LicenseProvider} source
 *
 * @typedef {Object} LicenseActionResult
 * @property {LicenseActionStatus} status
 * @property {boolean} isPro
 * @property {LicenseProvider} source
 * @property {string} [message]
 */
