import { useSyncExternalStore } from 'react';
import {
  isSoundEnabled,
  subscribeSoundPreference,
} from './soundEngine';

/**
 * Globally reactive hook for UI interaction sound preference.
 * Guaranteed independent from AudioPlayer narration and media playback.
 */
export function useSoundEnabled(): boolean {
  return useSyncExternalStore(
    subscribeSoundPreference,
    isSoundEnabled,
    () => true,
  );
}
