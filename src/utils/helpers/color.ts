import { rangeOf } from './index';

const HEX_COLOR_LENGTH = 6;
const HEX_DIGITS = '0123456789ABCDEF';
const LIGHTNESS_BREAKPOINT = 128;

export function buildRandomColor(): string {
  return `#${rangeOf(HEX_COLOR_LENGTH, () => HEX_DIGITS[Math.floor(Math.random() * HEX_DIGITS.length)]).join('')}`;
}

function perceivedLightness (r: number, g: number, b: number): number {
  return Math.round(Math.sqrt(0.299 * r ** 2 + 0.587 * g ** 2 + 0.114 * b ** 2));
}

/** @deprecated. Use same symbol from @shlinkio/shlink-frontend-kit */
export function isLightColor(colorHex: string): boolean {
  const [r, g, b] = (colorHex.match(/../g) ?? []).map((hex) => parseInt(hex, 16) || 0);
  return perceivedLightness(r, g, b) >= LIGHTNESS_BREAKPOINT;
}
