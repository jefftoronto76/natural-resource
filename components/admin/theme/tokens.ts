import { internalBorderTokens } from './borders';
import { internalColorTokens } from './colors';
import { internalMotionTokens } from './motion';
import { internalRadiusTokens } from './radius';
import { internalSpacingTokens } from './spacing';
import { internalStateTokens } from './states';
import { internalTypographyTokens } from './typography';
import { internalZIndexTokens } from './zIndex';

const themes = {
  light: {
    color: internalColorTokens.light,
    state: internalStateTokens.light
  },
  dark: {
    color: internalColorTokens.dark,
    state: internalStateTokens.dark
  }
} as const;

export const tokens = {
  themes,
  spacing: internalSpacingTokens,
  typography: internalTypographyTokens,
  radius: internalRadiusTokens,
  border: internalBorderTokens,
  motion: internalMotionTokens,
  zIndex: internalZIndexTokens
} as const;

export type Tokens = typeof tokens;
