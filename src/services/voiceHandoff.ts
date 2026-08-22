import { ScreenType } from '../types';

const REVIEW_SCREENS: ScreenType[] = ['understanding', 'recommendation', 'my-world', 'graph'];

/**
 * Live tools must not skip or complete the post-talk review.
 * Spoken confirmation always opens Understanding; only in-app taps
 * advance to event details, then My World.
 */
export function resolveLiveNavigateTarget(
  requested: string,
  current: ScreenType
): ScreenType | null {
  if (requested === 'conversation') {
    return current === 'conversation' ? null : 'conversation';
  }
  if (requested === 'home') {
    return 'home';
  }
  if ((REVIEW_SCREENS as string[]).includes(requested)) {
    return 'understanding';
  }
  return null;
}

export function shouldConsumeLiveSessionEvent(
  current: ScreenType,
  handoffLocked: boolean
): boolean {
  return !handoffLocked && current === 'conversation';
}

/** Graph updates may still arrive as the last Talk turn is wrapping up. Lock them onto Understanding. */
export function shouldApplyLiveGraphUpdate(current: ScreenType): boolean {
  return current === 'conversation' || current === 'understanding';
}
