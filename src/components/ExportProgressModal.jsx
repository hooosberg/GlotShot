import React from 'react';
import { X, Check, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../locales/i18n';

const ExportProgressModal = ({ isOpen, progress, onCancel, onClose }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const percentage = progress.total > 0 ? Math.min(100, Math.round((progress.current / progress.total) * 100)) : 0;
    const isCompleted = progress.status === 'completed';
    const isCancelled = progress.status === 'cancelled';
    const isError = progress.status === 'error';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-[400px] bg-[var(--app-card-bg-solid)] border border-[var(--app-border)] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-5 py-4 border-b border-[var(--app-border)] flex items-center justify-between">
                    <h3 className="font-semibold text-[var(--app-text-primary)] flex items-center gap-2">
                        {isCompleted ? (
                            <>
                                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                                {t('export.completed')}
                            </>
                        ) : isCancelled ? (
                            <>
                                <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                </div>
                                {t('export.cancelled')}
                            </>
                        ) : isError ? (
                            <>
                                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                                    <X className="w-3.5 h-3.5" />
                                </div>
                                {t('export.error')}
                            </>
                        ) : (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-[var(--app-accent)]" />
                                {t('export.exporting')}
                            </>
                        )}
                    </h3>
                    {/* Only show close button if not in progress (or if completed) */}
                    {(isCompleted || isCancelled || isError) && (
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-[var(--app-bg-elevated)] rounded text-[var(--app-text-muted)] hover:text-[var(--app-text-primary)] transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">

                    {/* Progress Bar (Show unless error) */}
                    {!isError && (
                        <div className="space-y-3">
                            <div className="flex justify-between text-[11px] font-medium text-[var(--app-text-secondary)] tracking-wide">
                                <span>{percentage}%</span>
                                <span>{progress.current} / {progress.total}</span>
                            </div>
                            <div className="h-2 w-full bg-[var(--app-bg-tertiary)] rounded-full overflow-hidden shadow-inner">
                                <div
                                    className={`h-full transition-all duration-300 ease-out relative overflow-hidden`}
                                    style={{
                                        width: `${percentage}%`,
                                        background: isCompleted
                                            ? '#22c55e' // Green-500
                                            : isCancelled
                                                ? '#eab308' // Yellow-500
                                                : `linear-gradient(90deg, #3b82f6 ${100 - percentage}%, #22c55e 100%)` // Blue to Green transition
                                    }}
                                >
                                    {/* Glossy effect */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status Message */}
                    <div className="text-sm font-medium text-center text-[var(--app-text-primary)] h-12 flex items-center justify-center px-4 bg-[var(--app-bg-secondary)] rounded-lg border border-[var(--app-border)]/50">
                        <span className="truncate w-full block">
                            {progress.message}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center pt-2">
                        {!isCompleted && !isCancelled && !isError ? (
                            <button
                                onClick={onCancel}
                                className="group px-6 py-1.5 bg-[var(--app-bg-elevated)] hover:bg-[var(--app-bg-tertiary)] border border-[var(--app-border)] rounded-full text-xs font-medium text-[var(--app-text-secondary)] hover:text-[var(--app-text-primary)] transition flex items-center gap-2 shadow-sm"
                            >
                                <span className="group-hover:hidden">{t('common.processing')}</span>
                                <span className="hidden group-hover:inline-flex items-center gap-1 text-red-400">
                                    <X className="w-3 h-3" />
                                    {t('common.cancel')}
                                </span>
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="px-8 py-2 bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white rounded-full text-sm font-medium shadow-lg shadow-[var(--app-accent)]/20 transition flex items-center gap-2"
                            >
                                {t('common.done')}
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ExportProgressModal;
