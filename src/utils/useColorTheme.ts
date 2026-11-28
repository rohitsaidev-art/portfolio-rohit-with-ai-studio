import { useSyncExternalStore } from 'react';
import {
  getColorTheme,
  subscribeColorTheme,
  type ColorTheme,
} from './colorTheme';

export function useColorTheme(): ColorTheme {
  return useSyncExternalStore(
    subscribeColorTheme,
    getColorTheme,
    () => 'apple',
  );
}
