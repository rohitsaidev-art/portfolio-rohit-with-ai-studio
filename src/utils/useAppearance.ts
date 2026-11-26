import { useSyncExternalStore } from 'react';
import {
  getAppearanceMode,
  getResolvedTheme,
  getSystemTheme,
  subscribeAppearance,
  type AppearanceMode,
  type ResolvedTheme,
} from './appearance';

export function useAppearanceMode(): AppearanceMode {
  return useSyncExternalStore(
    subscribeAppearance,
    getAppearanceMode,
    () => 'system',
  );
}

export function useResolvedTheme(): ResolvedTheme {
  return useSyncExternalStore(
    subscribeAppearance,
    getResolvedTheme,
    () => 'light',
  );
}

export function useSystemTheme(): ResolvedTheme {
  return useSyncExternalStore(
    subscribeAppearance,
    getSystemTheme,
    () => 'light',
  );
}
