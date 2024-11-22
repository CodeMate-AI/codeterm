import { CustomTheme, ThemeColors } from "../types/themeTypes";

const baseColors = {
  red: "#FF0000",
  green: "#00FF00",
  blue: "#0000FF",
  yellow: "#FFFF00",
  orange: "#FFA500",
  purple: "#800080",
  cyan: "#00FFFF",
  pink: "#FFC0CB",
};

export function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace(/^#/, "");
  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  return [r, g, b];
}

export function rgbToGray(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function getContrastingColor(hex: string): string {
  let [r, g, b] = hexToRgb(hex);
  let gray = rgbToGray(r, g, b);
  return gray > 128 ? "#000000" : "#FFFFFF";
}

function blendColors(color1: string, color2: string, weight: number): string {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);
  const r = Math.round(r1 * (1 - weight) + r2 * weight);
  const g = Math.round(g1 * (1 - weight) + g2 * weight);
  const b = Math.round(b1 * (1 - weight) + b2 * weight);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

export function generateThemeColors(
  themeName: string,
  bgColor: string
): CustomTheme {
  const textColor = getContrastingColor(bgColor);

  const colors: ThemeColors = {
    bgColor,
    textColor,
    primaryTextColor: blendColors(bgColor, "#FFFFFF", 0.4),
    secondaryTextColor: blendColors(bgColor, "#FFFFFF", 0.6),
    cursorColor: textColor,
    selectionBackgroundColor: blendColors(bgColor, "#FFFFFF", 0.1),
    commentColor: blendColors(bgColor, baseColors.green, 0.3),
    redColor: blendColors(bgColor, baseColors.red, 0.5),
    darkRedColor: blendColors(bgColor, baseColors.red, 0.7),
    orangeColor: blendColors(bgColor, baseColors.orange, 0.5),
    yellowColor: blendColors(bgColor, baseColors.yellow, 0.5),
    greenColor: blendColors(bgColor, baseColors.green, 0.5),
    darkGreenColor: blendColors(bgColor, baseColors.green, 0.7),
    purpleColor: blendColors(bgColor, baseColors.purple, 0.5),
    cyanColor: blendColors(bgColor, baseColors.cyan, 0.5),
    pinkColor: blendColors(bgColor, baseColors.pink, 0.5),
    blueColor: blendColors(bgColor, baseColors.blue, 0.5),
    darkBlueColor: blendColors(bgColor, baseColors.blue, 0.7),
    borderColor: blendColors(bgColor, "#FFFFFF", 0.1),
    grayColor: blendColors(bgColor, "#808080", 0.5),
    lightGrayColor: blendColors(bgColor, "#D3D3D3", 0.3),
    darkGrayColor: blendColors(bgColor, "#A9A9A9", 0.5),
    shadowColor: blendColors(bgColor, "#000000", 0.4),
    shadowColorLight: blendColors(bgColor, "#FFFFFF", 0.2),
  };

  return {
    themeName,
    colors,
  };
}
