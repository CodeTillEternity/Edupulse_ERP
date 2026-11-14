import { useEffect, useState, useCallback } from 'react';

const ZOOM_KEY = 'edupulse_desktop_zoom_level';
const DEFAULT_ZOOM = 1.0;
const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2.0;
const STEP = 0.1;

export function useDesktopZoom() {
  const [zoom, setZoomState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(ZOOM_KEY);
      if (saved) {
        const num = parseFloat(saved);
        if (!isNaN(num) && num >= MIN_ZOOM && num <= MAX_ZOOM) {
          return Math.round(num * 100) / 100;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_ZOOM;
  });

  const applyZoom = useCallback((newZoom: number) => {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(newZoom * 100) / 100));
    setZoomState(clamped);
    try {
      localStorage.setItem(ZOOM_KEY, clamped.toString());
    } catch {
      // ignore
    }
    
    // Apply Chromium / Edge WebView2 native zoom directly to document.body
    if (typeof document !== 'undefined' && document.body) {
      (document.body.style as any).zoom = clamped.toString();
    }
  }, []);

  const zoomIn = useCallback(() => applyZoom(zoom + STEP), [zoom, applyZoom]);
  const zoomOut = useCallback(() => applyZoom(zoom - STEP), [zoom, applyZoom]);
  const resetZoom = useCallback(() => applyZoom(DEFAULT_ZOOM), [applyZoom]);

  // Apply on initial mount and whenever zoom changes
  useEffect(() => {
    if (typeof document !== 'undefined' && document.body) {
      (document.body.style as any).zoom = zoom.toString();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl + + / Ctrl + = (zoom in)
      if (e.ctrlKey && (e.key === '=' || e.key === '+' || e.key === 'Add')) {
        e.preventDefault();
        applyZoom(zoom + STEP);
      }
      // Check for Ctrl + - (zoom out)
      else if (e.ctrlKey && (e.key === '-' || e.key === 'Subtract')) {
        e.preventDefault();
        applyZoom(zoom - STEP);
      }
      // Check for Ctrl + 0 (reset zoom)
      else if (e.ctrlKey && (e.key === '0' || e.key === 'NumPad0')) {
        e.preventDefault();
        applyZoom(DEFAULT_ZOOM);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          applyZoom(zoom + STEP);
        } else if (e.deltaY > 0) {
          applyZoom(zoom - STEP);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [zoom, applyZoom]);

  return { 
    zoom, 
    zoomPercent: Math.round(zoom * 100), 
    zoomIn, 
    zoomOut, 
    resetZoom, 
    setZoom: applyZoom 
  };
}
