'use client';
import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode } from 'react';
import { commerceReducer, initialCommerceState, restoreCommerce, type CommerceAction, type CommerceState } from '@/lib/commerce';
const key = 'ecobiz-commerce-sandbox-v1';
const CommerceContext = createContext<{ state: CommerceState; dispatch: Dispatch<CommerceAction>; ready: boolean; notice: string } | null>(null);
export function CommerceProvider({ children, preview = false }: { children: ReactNode; preview?: boolean }) {
  const [state, dispatch] = useReducer(commerceReducer, initialCommerceState);
  const [ready, setReady] = useState(preview);
  const [notice, setNotice] = useState('');
  // Browser storage is restored after the identical server/client render, as in DemoProvider.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (preview) return;
    try {
      const raw = localStorage.getItem(key); const restored = restoreCommerce(raw);
      dispatch({ type: 'restore', state: restored });
      if (raw && restored === initialCommerceState) setNotice('Sample data reset.');
    } catch { setNotice('Storage unavailable. Changes last for this visit.'); }
    setReady(true);
  }, [preview]);
  useEffect(() => {
    if (!ready || preview) return;
    try { localStorage.setItem(key, JSON.stringify(state)); }
    catch { setNotice('Storage unavailable. Changes last for this visit.'); }
  }, [state, ready, preview]);
  /* eslint-enable react-hooks/set-state-in-effect */
  return <CommerceContext.Provider value={{ state, dispatch, ready, notice }}>{children}</CommerceContext.Provider>;
}
export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) throw new Error('CommerceProvider is required');
  return context;
}
