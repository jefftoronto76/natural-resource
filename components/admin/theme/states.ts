import { internalColorTokens } from './colors';
import { internalMotionTokens } from './motion';

/** @internal Aggregation-only export. Use tokens.ts as public entrypoint. */
export const internalStateTokens = {
  light: {
    hover: {
      surface: internalColorTokens.light.surface.elevated,
      text: internalColorTokens.light.text.primary,
      border: internalColorTokens.light.border.strong,
      duration: internalMotionTokens.duration.fast,
      easing: internalMotionTokens.easing.standard
    },
    active: {
      surface: internalColorTokens.light.surface.panel,
      text: internalColorTokens.light.text.primary,
      border: internalColorTokens.light.border.strong,
      duration: internalMotionTokens.duration.fast,
      easing: internalMotionTokens.easing.accelerate
    },
    focus: {
      ring: internalColorTokens.light.interactive.primary,
      duration: internalMotionTokens.duration.fast,
      easing: internalMotionTokens.easing.standard
    },
    disabled: {
      surface: internalColorTokens.light.surface.elevated,
      text: internalColorTokens.light.text.muted,
      border: internalColorTokens.light.border.subtle,
      duration: internalMotionTokens.reduced.duration,
      easing: internalMotionTokens.reduced.easing
    },
    selected: {
      surface: internalColorTokens.light.interactive.primary,
      text: internalColorTokens.light.text.inverse,
      border: internalColorTokens.light.interactive.primary,
      duration: internalMotionTokens.duration.normal,
      easing: internalMotionTokens.easing.decelerate
    }
  },
  dark: {
    hover: {
      surface: internalColorTokens.dark.surface.elevated,
      text: internalColorTokens.dark.text.primary,
      border: internalColorTokens.dark.border.strong,
      duration: internalMotionTokens.duration.fast,
      easing: internalMotionTokens.easing.standard
    },
    active: {
      surface: internalColorTokens.dark.surface.panel,
      text: internalColorTokens.dark.text.primary,
      border: internalColorTokens.dark.border.strong,
      duration: internalMotionTokens.duration.fast,
      easing: internalMotionTokens.easing.accelerate
    },
    focus: {
      ring: internalColorTokens.dark.interactive.primary,
      duration: internalMotionTokens.duration.fast,
      easing: internalMotionTokens.easing.standard
    },
    disabled: {
      surface: internalColorTokens.dark.surface.elevated,
      text: internalColorTokens.dark.text.muted,
      border: internalColorTokens.dark.border.subtle,
      duration: internalMotionTokens.reduced.duration,
      easing: internalMotionTokens.reduced.easing
    },
    selected: {
      surface: internalColorTokens.dark.interactive.primary,
      text: internalColorTokens.dark.text.inverse,
      border: internalColorTokens.dark.interactive.primary,
      duration: internalMotionTokens.duration.normal,
      easing: internalMotionTokens.easing.decelerate
    }
  }
} as const;
