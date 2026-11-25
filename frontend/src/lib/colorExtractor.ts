/**
 * Color extraction & adaptive atmospheric theming utility for EduPulse ERP Desktop.
 * Dynamically samples an institution's logo emblem and produces a fully matched
 * enterprise atmosphere (primary brand, secondary accent, deep tinted dark tones,
 * and high-fidelity CSS gradients & halo glows).
 */

export interface ExtractedColors {
  primary: string;         // e.g. '#991b1b' or '#dc2626'
  secondary: string;       // e.g. '#f59e0b' or '#eab308'
  primaryRgb: string;      // e.g. '153, 27, 27'
  secondaryRgb: string;    // e.g. '245, 158, 11'
  bgDark: string;          // Deep tinted background base (e.g. '#0f0608')
  bgDarkest: string;       // Deepest vignette edge (e.g. '#060304')
  gradientStyle: string;   // Full multi-stop radial gradient
  haloGlowStyle: string;   // Center ambient backlight halo
  boxShadowStyle: string;  // Colored crest container elevation shadow
}

export function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16) || 0;
    const g = parseInt(cleanHex[1] + cleanHex[1], 16) || 0;
    const b = parseInt(cleanHex[2] + cleanHex[2], 16) || 0;
    return [r, g, b];
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return [r, g, b];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgbToString(r: number, g: number, b: number): string {
  return `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}`;
}

/**
 * Derives a full atmospheric theme from any primary and optional secondary hex color.
 * Eliminates generic slate/blue defaults and tints every gradient stop with the brand's authentic hue.
 */
export function deriveThemeFromColor(primaryHex: string, secondaryHex?: string): ExtractedColors {
  const [pr, pg, pb] = hexToRgb(primaryHex);
  
  let sr: number, sg: number, sb: number;
  if (secondaryHex) {
    [sr, sg, sb] = hexToRgb(secondaryHex);
  } else {
    // Generate a harmonious luminous accent if no secondary is supplied
    sr = Math.min(255, Math.round(pr * 1.35) + 30);
    sg = Math.min(255, Math.round(pg * 1.35) + 30);
    sb = Math.min(255, Math.round(pb * 1.35) + 30);
  }

  const primaryRgb = rgbToString(pr, pg, pb);
  const secondaryRgb = rgbToString(sr, sg, sb);

  // Deep tinted dark tones based on the primary hue (avoids cold navy blue)
  const darkR = Math.max(10, Math.round(pr * 0.10));
  const darkG = Math.max(6, Math.round(pg * 0.10));
  const darkB = Math.max(8, Math.round(pb * 0.10));
  const bgDark = rgbToHex(darkR, darkG, darkB);

  const darkestR = Math.max(5, Math.round(pr * 0.04));
  const darkestG = Math.max(3, Math.round(pg * 0.04));
  const darkestB = Math.max(4, Math.round(pb * 0.04));
  const bgDarkest = rgbToHex(darkestR, darkestG, darkestB);

  const gradientStyle = `radial-gradient(circle at 50% 42%, rgba(${primaryRgb}, 0.50) 0%, rgba(${secondaryRgb}, 0.20) 32%, ${bgDark} 68%, ${bgDarkest} 100%)`;
  const haloGlowStyle = `radial-gradient(circle, rgba(${primaryRgb}, 0.58) 0%, rgba(${secondaryRgb}, 0.28) 45%, transparent 72%)`;
  const boxShadowStyle = `0 25px 60px -10px rgba(${primaryRgb}, 0.65), 0 0 35px rgba(${secondaryRgb}, 0.38), 0 0 0 1px rgba(255, 255, 255, 0.35)`;

  return {
    primary: primaryHex,
    secondary: secondaryHex || rgbToHex(sr, sg, sb),
    primaryRgb,
    secondaryRgb,
    bgDark,
    bgDarkest,
    gradientStyle,
    haloGlowStyle,
    boxShadowStyle,
  };
}

/**
 * Default fallback theme (Deep Sapphire Navy) used only when no custom logo or colors exist.
 */
export const DEFAULT_THEME = deriveThemeFromColor('#2563eb', '#38bdf8');

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rf = r / 255;
  const gf = g / 255;
  const bf = b / 255;
  const max = Math.max(rf, gf, bf);
  const min = Math.min(rf, gf, bf);
  const delta = max - min;
  
  let h = 0;
  if (delta > 0) {
    if (max === rf) {
      h = ((gf - bf) / delta) % 6;
    } else if (max === gf) {
      h = (bf - rf) / delta + 2;
    } else {
      h = (rf - gf) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  
  const s = max === 0 ? 0 : delta / max;
  const v = max;
  return [h, s, v];
}

/**
 * Robustly extracts the dominant primary and secondary brand colors from any image.
 * Uses HSV color-clustering to filter out transparent and stark white/black backgrounds,
 * identifying distinct hues (e.g. Red & Gold for Arya College).
 */
export function extractDominantColors(imageSrc: string): Promise<ExtractedColors> {
  return new Promise((resolve) => {
    if (!imageSrc) {
      resolve(DEFAULT_THEME);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(DEFAULT_THEME);
          return;
        }

        const size = 80;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const data = ctx.getImageData(0, 0, size, size).data;
        const colorBins: Record<string, { r: number; g: number; b: number; weight: number }> = {};

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Ignore transparent or translucent pixels
          if (a < 140) continue;

          // Filter out white / very light backgrounds (common around crests)
          if (r > 215 && g > 215 && b > 215) continue;

          // Filter out very dark / black pixels
          if (r < 25 && g < 25 && b < 25) continue;

          const [, s, v] = rgbToHsv(r, g, b);
          // Filter out washed-out grey/desaturated pixels
          if (s < 0.22) continue;

          // Bin into 20-step increments
          const qr = Math.min(255, Math.round(r / 20) * 20);
          const qg = Math.min(255, Math.round(g / 20) * 20);
          const qb = Math.min(255, Math.round(b / 20) * 20);
          const key = `${qr},${qg},${qb}`;

          if (!colorBins[key]) {
            colorBins[key] = { r: qr, g: qg, b: qb, weight: 0 };
          }
          // Weight heavily towards vibrant, saturated brand colors
          colorBins[key].weight += (1 + s * 2.8 + (v > 0.3 && v < 0.95 ? 1.0 : 0));
        }

        const sortedBins = Object.values(colorBins).sort((a, b) => b.weight - a.weight);

        // Find up to 4 distinct hues
        const distinct: Array<{ r: number; g: number; b: number; h: number; s: number; v: number; weight: number }> = [];
        for (const item of sortedBins) {
          const [h, s, v] = rgbToHsv(item.r, item.g, item.b);
          let isDistinct = true;
          for (const d of distinct) {
            const hDiff = Math.min(Math.abs(h - d.h), 360 - Math.abs(h - d.h));
            const rgbDist = Math.sqrt((item.r - d.r) ** 2 + (item.g - d.g) ** 2 + (item.b - d.b) ** 2);
            if (hDiff < 35 && rgbDist < 75) {
              isDistinct = false;
              break;
            }
          }
          if (isDistinct) {
            distinct.push({ ...item, h, s, v });
            if (distinct.length >= 4) break;
          }
        }

        if (distinct.length > 0) {
          let primaryItem = distinct[0];
          let secondaryItem = distinct.length > 1 ? distinct[1] : null;

          // Heraldic refinement: If an emblem contains both Yellow/Gold (hue 35..65)
          // and Red/Maroon/Crimson (hue 330..360 or 0..28), Red makes a far more regal,
          // deep atmospheric background, while Gold serves as the luminous ambient backlight.
          if (distinct.length >= 2) {
            const hasYellow = distinct.find(d => d.h >= 35 && d.h <= 65);
            const hasRed = distinct.find(d => d.h >= 330 || d.h <= 28);
            if (hasYellow && hasRed) {
              primaryItem = hasRed;
              secondaryItem = hasYellow;
            }
          }

          const primaryHex = rgbToHex(primaryItem.r, primaryItem.g, primaryItem.b);
          const secondaryHex = secondaryItem
            ? rgbToHex(secondaryItem.r, secondaryItem.g, secondaryItem.b)
            : undefined;

          resolve(deriveThemeFromColor(primaryHex, secondaryHex));
          return;
        }
      } catch (err) {
        console.warn('[colorExtractor] Extraction error:', err);
      }

      // Fallback
      resolve(DEFAULT_THEME);
    };

    img.onerror = () => {
      resolve(DEFAULT_THEME);
    };

    img.src = imageSrc;
  });
}
