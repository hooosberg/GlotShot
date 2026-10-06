const { app, inAppPurchase } = require('electron');
const Store = require('electron-store');

const MAS_PRODUCT_ID = 'com.maohuhu.glotshot.pro.lifetime';
const USER_CANCELLED_ERROR_CODE = 2;
const DEFAULT_RESTORE_TIMEOUT_MS = 10000;

function createDeferred() {
  let resolve;
  const promise = new Promise((innerResolve) => {
    resolve = innerResolve;
  });
  return { promise, resolve };
}

function buildStatusResult(isPro, source) {
  return {
    isPro,
    source
  };
}

function buildActionResult(status, isPro, source, message) {
  return {
    status,
    isPro,
    source,
    message
  };
}

function createDefaultIap() {
  return {
    canMakePayments: () => inAppPurchase?.canMakePayments?.() ?? false,
    getProducts: async (productIDs) => inAppPurchase.getProducts(productIDs),
    purchaseProduct: async (productID) => inAppPurchase.purchaseProduct(productID),
    restoreCompletedTransactions: () => inAppPurchase.restoreCompletedTransactions(),
    finishTransactionByDate: (date) => inAppPurchase.finishTransactionByDate(date),
    on: (event, listener) => {
      inAppPurchase.on(event, listener);
      return inAppPurchase;
    }
  };
}

class LicenseService {
  constructor(options = {}) {
    this.runtime = options.runtime || {
      isMAS: process.mas === true,
      isPackaged: app.isPackaged
    };
    this.store = options.store || new Store({
      name: 'license',
      defaults: {
        proPurchased: false,
        purchaseSource: null,
        updatedAt: null
      }
    });
    this.iap = options.iap || createDefaultIap();
    this.logger = options.logger || console;
    this.restoreTimeoutMs = options.restoreTimeoutMs ?? DEFAULT_RESTORE_TIMEOUT_MS;
    this.productId = options.productId ?? MAS_PRODUCT_ID;
    this.provider = this.resolveProvider();
    this.purchasePending = null;
    this.purchaseResolve = null;
    this.restorePending = null;
    this.listenerRegistered = false;
    this.ensureTransactionListener();
  }

  getProvider() {
    return this.provider;
  }

  async checkStatus() {
    return buildStatusResult(this.getCurrentPurchasedState(), this.provider);
  }

  async purchasePro() {
    if (this.provider !== 'mas') {
      this.clearStoredPurchase();
      return buildActionResult('not_supported', false, this.provider);
    }

    if (!this.iap.canMakePayments()) {
      return buildActionResult(
        'failed',
        this.readPurchasedState(),
        this.provider,
        'Payments are disabled for this Apple account.'
      );
    }

    if (this.purchasePending) {
      return this.purchasePending;
    }

    const deferred = createDeferred();
    const pendingPromise = deferred.promise;
    this.purchasePending = pendingPromise;
    this.purchaseResolve = (result) => {
      deferred.resolve(result);
      this.purchasePending = null;
      this.purchaseResolve = null;
    };

    try {
      const products = await this.iap.getProducts([this.productId]);
      const hasProduct = products.some((product) => product.productIdentifier === this.productId);

      if (!hasProduct) {
        this.purchaseResolve(
          buildActionResult('failed', this.readPurchasedState(), this.provider, `Product not found: ${this.productId}`)
        );
        return pendingPromise;
      }

      const queued = await this.iap.purchaseProduct(this.productId);
      if (!queued) {
        this.purchaseResolve(
          buildActionResult(
            'failed',
            this.readPurchasedState(),
            this.provider,
            'Purchase request was not added to the queue.'
          )
        );
      }
    } catch (error) {
      this.logger.error('MAS purchase failed before transaction update:', error);
      if (this.purchaseResolve) {
        this.purchaseResolve(
          buildActionResult(
            'failed',
            this.readPurchasedState(),
            this.provider,
            error instanceof Error ? error.message : 'Purchase request failed.'
          )
        );
      }
    }

    return pendingPromise;
  }

  async restorePurchases() {
    if (this.provider !== 'mas') {
      this.clearStoredPurchase();
      return buildActionResult('not_supported', false, this.provider);
    }

    if (this.restorePending) {
      return this.restorePending.promise;
    }

    const deferred = createDeferred();
    const pendingRestore = {
      found: false,
      promise: deferred.promise,
      resolve: (result) => {
        if (pendingRestore.timer) {
          clearTimeout(pendingRestore.timer);
          pendingRestore.timer = null;
        }
        deferred.resolve(result);
        this.restorePending = null;
      },
      timer: null
    };

    pendingRestore.timer = setTimeout(() => {
      if (pendingRestore.found) {
        pendingRestore.resolve(buildActionResult('success', true, this.provider));
        return;
      }
      pendingRestore.resolve(buildActionResult('not_found', this.readPurchasedState(), this.provider));
    }, this.restoreTimeoutMs);

    this.restorePending = pendingRestore;

    try {
      this.iap.restoreCompletedTransactions();
    } catch (error) {
      this.logger.error('MAS restore failed before transaction update:', error);
      pendingRestore.resolve(
        buildActionResult(
          'failed',
          this.readPurchasedState(),
          this.provider,
          error instanceof Error ? error.message : 'Restore request failed.'
        )
      );
    }

    return pendingRestore.promise;
  }

  resolveProvider() {
    if (this.runtime.isMAS) {
      return 'mas';
    }

    if (!this.runtime.isPackaged) {
      return 'dev-stub';
    }

    return 'unsupported';
  }

  ensureTransactionListener() {
    if (this.provider !== 'mas' || this.listenerRegistered) {
      return;
    }

    this.iap.on('transactions-updated', this.handleTransactionsUpdated);
    this.listenerRegistered = true;
  }

  handleTransactionsUpdated = (_event, transactions) => {
    for (const transaction of transactions) {
      if (transaction.payment.productIdentifier !== this.productId) {
        continue;
      }

      if (transaction.transactionState === 'purchased' || transaction.transactionState === 'restored') {
        this.persistPurchased('mas');
        this.iap.finishTransactionByDate(transaction.transactionDate);

        if (this.purchaseResolve) {
          this.purchaseResolve(buildActionResult('success', true, this.provider));
        }

        if (this.restorePending) {
          this.restorePending.found = true;
          this.restorePending.resolve(buildActionResult('success', true, this.provider));
        }

        continue;
      }

      if (transaction.transactionState === 'failed') {
        this.iap.finishTransactionByDate(transaction.transactionDate);
        const status = transaction.errorCode === USER_CANCELLED_ERROR_CODE ? 'cancelled' : 'failed';
        const message = transaction.errorMessage || undefined;

        if (this.purchaseResolve) {
          this.purchaseResolve(buildActionResult(status, this.readPurchasedState(), this.provider, message));
        }

        continue;
      }

      if (transaction.transactionState === 'deferred' && this.purchaseResolve) {
        this.purchaseResolve(
          buildActionResult('failed', this.readPurchasedState(), this.provider, 'Purchase is pending approval.')
        );
      }
    }
  };

  persistPurchased(source) {
    this.store.set('proPurchased', true);
    this.store.set('purchaseSource', source);
    this.store.set('updatedAt', new Date().toISOString());
  }

  clearStoredPurchase() {
    this.store.set('proPurchased', false);
    this.store.set('purchaseSource', null);
    this.store.set('updatedAt', null);
  }

  getCurrentPurchasedState() {
    if (this.provider !== 'mas') {
      this.clearStoredPurchase();
      return false;
    }

    return this.readPurchasedState();
  }

  readPurchasedState() {
    return this.store.get('proPurchased', false);
  }
}

function createLicenseService(options = {}) {
  return new LicenseService(options);
}

module.exports = {
  LicenseService,
  createLicenseService
};
