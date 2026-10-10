import React, { createContext, ReactNode, useContext } from 'react';
import { useProgress } from './useProgress';

type ProgressStore = ReturnType<typeof useProgress>;

const ProgressContext = createContext<ProgressStore | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const store = useProgress();
  return <ProgressContext.Provider value={store}>{children}</ProgressContext.Provider>;
}

export function useProgressStore(): ProgressStore {
  const store = useContext(ProgressContext);
  if (!store) throw new Error('useProgressStore must be used inside ProgressProvider.');
  return store;
}
