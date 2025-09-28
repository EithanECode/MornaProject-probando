"use client";

import { useTranslation } from '@/hooks/useTranslation';

export function useTimeTranslations() {
  const { t } = useTranslation();

  const getTimeAgo = (lastUpdated: Date | null): string => {
    if (!lastUpdated) return t('admin.management.financial.timeAgo.never');
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) {
      return t('admin.management.financial.timeAgo.lessThanMinute');
    }
    
    if (diffMinutes < 60) {
      return t('admin.management.financial.timeAgo.minutesAgo', {
        count: diffMinutes,
        plural: diffMinutes !== 1 ? 's' : ''
      });
    }
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return t('admin.management.financial.timeAgo.hoursAgo', {
        count: diffHours,
        plural: diffHours !== 1 ? 's' : ''
      });
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return t('admin.management.financial.timeAgo.daysAgo', {
      count: diffDays,
      plural: diffDays !== 1 ? 's' : ''
    });
  };

  const translateSource = (source: string): string => {
    switch (source) {
      case 'BCV Oficial':
        return t('admin.management.financial.sources.bcvOfficial');
      case 'Oficial PBOC':
        return t('admin.management.financial.sources.pbocOfficial');
      default:
        return source; // Mantener el original si no hay traducción
    }
  };

  return {
    getTimeAgo,
    translateSource
  };
}
