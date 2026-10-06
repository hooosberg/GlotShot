import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Crown, Check } from 'lucide-react';
import { useTranslation } from '../locales/i18n';
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

  const withStoreDetail = (message, result) => {
    if (!result?.message) {
      return message;
    }

    return `${message} ${result.message}`;
  };

  const getActionErrorMessage = (result, action) => {
    if (action === 'restore' && result.status === 'not_found') {
      return t('paywall.restoreNotFound');
    }

    if (result.status === 'cancelled') {
      return t('paywall.purchaseCancelled');
    }

    if (result.status === 'not_supported') {
      return action === 'purchase'
        ? withStoreDetail(t('paywall.purchaseNotSupported'), result)
        : withStoreDetail(t('paywall.restoreNotSupported'), result);
    }

    return action === 'purchase'
      ? withStoreDetail(t('paywall.purchaseFailed'), result)
      : withStoreDetail(t('paywall.restoreFailed'), result);
  };

  useEffect(() => {
    if (!isOpen) {
      setPurchasing(false);
      setRestoring(false);
      setError(null);
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handlePurchase = async () => {
    setPurchasing(true);
    setError(null);

    try {
      const result = await onUnlock();
      if (!result || result.status === 'success') {
        onClose();
        return;
      }

      setError(getActionErrorMessage(result, 'purchase'));
    } catch (purchaseError) {
      console.error('Purchase flow failed:', purchaseError);
      setError(t('paywall.purchaseFailed'));
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError(null);

    try {
      const result = await LicenseManager.restorePurchases();
      if (result.status === 'success') {
        onClose();
        return;
      }

      setError(getActionErrorMessage(result, 'restore'));
    } catch (restoreError) {
      console.error('Restore flow failed:', restoreError);
      setError(t('paywall.restoreFailed'));
    } finally {
      setRestoring(false);
    }
  };

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="paywall-backdrop" onClick={onClose}>
      <div className="paywall-dialog" onClick={(event) => event.stopPropagation()}>
        <div className="paywall-header">
          <div className="paywall-brand">
            <div className="paywall-brand-icon">
              <Crown size={20} />
            </div>
            <div className="paywall-brand-copy">
              <div className="paywall-kicker">{t('paywall.kicker')}</div>
              <h3 className="paywall-title">{t('paywall.title')}</h3>
            </div>
          </div>
          <button
            type="button"
            className="paywall-close"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <X size={18} />
          </button>
        </div>

        <p className="paywall-subtitle">{t('paywall.subtitle')}</p>

        <div className="paywall-offer">
          <div className="paywall-price-badge">{t('paywall.lifetimeBadge')}</div>
          <div className="paywall-price-value">{t('paywall.priceValue')}</div>
        </div>

        <div className="paywall-benefits">
          {BENEFITS.map((benefit) => (
            <div className="paywall-benefit" key={benefit.titleKey}>
              <span className="paywall-benefit-check">
                <Check size={11} />
              </span>
              <div className="paywall-benefit-copy">
                <div className="paywall-benefit-title">{t(benefit.titleKey)}</div>
                <div className="paywall-benefit-desc">{t(benefit.descKey)}</div>
              </div>
            </div>
          ))}
        </div>

        {error && <div className="paywall-error">{error}</div>}

        <div className="paywall-footer">
          <button
            type="button"
            className="paywall-restore-btn"
            onClick={() => void handleRestore()}
            disabled={purchasing || restoring}
          >
            {restoring ? t('paywall.restoring') : t('paywall.restorePurchase')}
          </button>

          <div className="paywall-actions">
            <button
              type="button"
              className="paywall-secondary-btn"
              onClick={onClose}
              disabled={purchasing || restoring}
            >
              {t('paywall.cancel')}
            </button>
            <button
              type="button"
              className="paywall-primary-btn"
              onClick={() => void handlePurchase()}
              disabled={purchasing || restoring}
            >
              {purchasing ? t('paywall.purchasing') : t('paywall.unlockNow')}
            </button>
          </div>
        </div>

        <div className="paywall-cta-note">{t('paywall.ctaNote')}</div>
      </div>
    </div>,
    document.body
  );
}
