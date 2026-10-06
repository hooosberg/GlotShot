import { FREE_TRANSLATION_LIMIT } from '../shared/license.js';

const LICENSE_CHANGE_EVENT = 'glotshot-license-change';

let cachedStatus = {
  isPro: false,
  source: 'unsupported'
};

function emitLicenseChange(state) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(LICENSE_CHANGE_EVENT, { detail: state }));
}

function updateCachedStatus(nextStatus) {
  const shouldEmit = cachedStatus.isPro !== nextStatus.isPro;
  cachedStatus = nextStatus;

  if (shouldEmit) {
    emitLicenseChange({ isPro: nextStatus.isPro });
  }
}

function getFallbackActionResult(status, message) {
  return {
    status,
    isPro: cachedStatus.isPro,
    source: cachedStatus.source,
    message
  };
}

export class LicenseManager {
  static async initialize() {
    if (typeof window === 'undefined' || !window.license?.checkStatus) {
      return cachedStatus;
    }

    try {
      const result = await window.license.checkStatus();
      updateCachedStatus(result);
      return result;
    } catch (error) {
      console.error('Failed to initialize license state:', error);
      return cachedStatus;
    }
  }

  static isPro() {
    return cachedStatus.isPro;
  }

  static getState() {
    return { isPro: this.isPro() };
  }

  static getProvider() {
    return cachedStatus.source;
  }

  static onChange(listener) {
    if (typeof window === 'undefined') {
      return () => { };
    }

    const handler = (event) => listener(event.detail || this.getState());
    window.addEventListener(LICENSE_CHANGE_EVENT, handler);
    return () => window.removeEventListener(LICENSE_CHANGE_EVENT, handler);
  }

  static async purchasePro() {
    if (typeof window === 'undefined' || !window.license?.purchasePro) {
      return getFallbackActionResult('not_supported');
    }

    try {
      const result = await window.license.purchasePro();
      updateCachedStatus({
        isPro: result.isPro,
        source: result.source
      });
      return result;
    } catch (error) {
      console.error('Purchase failed:', error);
      return getFallbackActionResult('failed', error instanceof Error ? error.message : 'Purchase failed.');
    }
  }

  static async restorePurchases() {
    if (typeof window === 'undefined' || !window.license?.restorePurchases) {
      return getFallbackActionResult('not_supported');
    }

    try {
      const result = await window.license.restorePurchases();
      updateCachedStatus({
        isPro: result.isPro,
        source: result.source
      });
      return result;
    } catch (error) {
      console.error('Restore failed:', error);
      return getFallbackActionResult('failed', error instanceof Error ? error.message : 'Restore failed.');
    }
  }

  static checkTranslationAccess(currentCount) {
    if (this.isPro() || currentCount < FREE_TRANSLATION_LIMIT) {
      return { allowed: true, requiresPro: false };
    }

    return { allowed: false, requiresPro: true };
  }

  static setProStatus(enabled) {
    updateCachedStatus({
      isPro: enabled,
      source: 'dev-stub'
    });
  }
}

export default LicenseManager;
