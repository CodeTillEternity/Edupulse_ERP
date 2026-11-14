/**
 * Extracts the dominant vibrant color palette from any image data URL or image source.
 * Converts RGB to Hex and gives a clean RGB string for CSS rgba() gradients.
 */
export interface ExtractedColors {
  primary: string;
  secondary: string;
  rgb: string;
}

export function hexToRgb(hex: string): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 37;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 99;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 235;
  return `${r}, ${g}, ${b}`;
}

export function extractDominantColors(imageSrc: string): Promise<ExtractedColors> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ primary: '#2563eb', secondary: '#1e1b4b', rgb: '37, 99, 235' });
          return;
        }

        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const data = ctx.getImageData(0, 0, size, size).data;
        const colorCounts: Record<string, { r: number; g: number; b: number; count: number; weight: number }> = {};

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Ignore transparent pixels
          if (a < 128) continue;

          // Compute lightness & saturation
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const l = (max + min) / 510; // 0 to 1

          // Skip pure black/dark background (< 12%) and pure white background (> 90%)
          if (l < 0.12 || l > 0.90) continue;

          const delta = max - min;
          const sat = l > 0.5 ? delta / (510 - max - min) : delta / (max + min);

          // We heavily prioritize vibrant, saturated brand colors (reds, blues, golds, greens)
          if (sat < 0.18) continue;

          // Quantize to 24-step bins to cluster similar hues
          const qr = Math.min(255, Math.round(r / 24) * 24);
          const qg = Math.min(255, Math.round(g / 24) * 24);
          const qb = Math.min(255, Math.round(b / 24) * 24);
          const key = `${qr},${qg},${qb}`;

          if (!colorCounts[key]) {
            colorCounts[key] = { r: qr, g: qg, b: qb, count: 0, weight: 0 };
          }
          colorCounts[key].count += 1;
          colorCounts[key].weight += (1 + sat * 2.5); // Boost vibrant colors over dull ones
        }

        const candidates = Object.values(colorCounts).sort((a, b) => b.weight - a.weight);

        if (candidates.length > 0) {
          const best = candidates[0];
          const toHex = (n: number) => n.toString(16).padStart(2, '0');
          const primaryHex = `#${toHex(best.r)}${toHex(best.g)}${toHex(best.b)}`;
          const rgbString = `${best.r}, ${best.g}, ${best.b}`;

          let secondaryHex = '#1e1b4b';
          if (candidates.length > 1) {
            const second = candidates[1];
            secondaryHex = `#${toHex(second.r)}${toHex(second.g)}${toHex(second.b)}`;
          }

          resolve({
            primary: primaryHex,
            secondary: secondaryHex,
            rgb: rgbString,
          });
          return;
        }
      } catch (e) {
        console.warn('[colorExtractor] Failed to extract colors:', e);
      }

      // Default fallback
      resolve({ primary: '#2563eb', secondary: '#1e1b4b', rgb: '37, 99, 235' });
    };

    img.onerror = () => {
      resolve({ primary: '#2563eb', secondary: '#1e1b4b', rgb: '37, 99, 235' });
    };

    img.src = imageSrc;
  });
}
