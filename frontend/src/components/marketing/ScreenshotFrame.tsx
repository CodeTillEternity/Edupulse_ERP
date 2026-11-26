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
      className={`rounded-xl border border-enterprise-border bg-white shadow-2xl overflow-hidden ${className}`}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-enterprise-grey border-b border-enterprise-border">
        <div className="flex gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex-1 min-w-0 flex justify-center">
          <div className="inline-flex max-w-full items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md bg-white border border-enterprise-border text-xs text-enterprise-ink-muted font-mono">
            <svg
              className="w-3 h-3 shrink-0 text-enterprise-forest"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="truncate">{url}</span>
          </div>
        </div>
        <div className="hidden sm:block w-[52px] shrink-0" />
      </div>

      {/* Screenshot */}
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
