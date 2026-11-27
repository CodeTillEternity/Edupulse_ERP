interface ScreenshotFrameProps {
  src: string;
  alt: string;
  url?: string;
  priority?: boolean;
  className?: string;
}

export default function ScreenshotFrame({
  src,
  alt,
  url = 'app.edupulseerp.in',
  priority = false,
  className = '',
}: ScreenshotFrameProps) {
  return (
    <div
      className={`rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)] ${className}`}
    >
      {/* Minimal architectural address bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-800/90">
        <span className="text-[11px] font-mono text-zinc-500 truncate">
          {url}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 shrink-0 ml-3">
          Live ERP
        </span>
      </div>

      {/* Genuine ERP Screenshot */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding={priority ? 'sync' : 'async'}
        className="w-full h-auto block"
      />
    </div>
  );
}
