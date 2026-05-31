'use client';

import { useEffect } from 'react';
import { showToast } from './ToastProvider';

export function SessionExpiredToast() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const flag = window.localStorage.getItem('retreat.session_expired');
    if (flag === 'true') {
      window.localStorage.removeItem('retreat.session_expired');
      showToast('error', 'Session expired. Please sign in again.');
    }
  }, []);

  return null;
}
