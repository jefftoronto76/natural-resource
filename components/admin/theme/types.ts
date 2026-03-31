import type { CSSProperties } from 'react';

export type ThemeStyle = CSSProperties & { [key: `--${string}`]: string };
