"use client";

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { X, Mail } from 'lucide-react';

interface ResetLinkSentModalProps {
  email: string;
  open: boolean;
  onClose: () => void;
  onResend?: () => Promise<void> | void;
}

const commonBtn = "px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

export const ResetLinkSentModal: React.FC<ResetLinkSentModalProps> = ({ email, open, onClose, onResend }) => {
  const { t } = useTranslation();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  if (!open) return null;

  const handleResend = async (): Promise<void> => {
    if (!onResend) return;
    setResending(true);
    setResent(false);
    try {
      await onResend();
      setResent(true);
      setTimeout(() => setResent(false), 2500);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          aria-label={t('authPasswordResetModal.close')}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
        >
          <X size={18} />
        </button>
        <div className="p-6 pt-8 text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Mail className="text-blue-600 dark:text-blue-400" size={28} />
          </div>
          <h2 className="text-xl font-semibold mb-1">{t('authPasswordResetModal.title')}</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            {t('authPasswordResetModal.subtitle')} <span className="font-medium">{email}</span>
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-6 leading-relaxed">
            {t('authPasswordResetModal.checkInbox')}<br />{t('authPasswordResetModal.info')}
          </p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-xs px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              {t('authPasswordResetModal.sentTo', { email })}
            </span>
          </div>
          <div className="mb-4" />
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className={`${commonBtn} bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 w-full`}
            >
              {t('authPasswordResetModal.close')}
            </button>
            <button
              disabled={resending}
              onClick={handleResend}
              className={`${commonBtn} w-full bg-blue-600 text-white hover:bg-blue-500 disabled:bg-blue-400 flex items-center justify-center gap-2`}
            >
              {resending ? t('authPasswordResetModal.resending') : resent ? t('authPasswordResetModal.resent') : t('authPasswordResetModal.resendLink')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetLinkSentModal;
