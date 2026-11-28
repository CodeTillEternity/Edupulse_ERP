import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Platform', to: '/platform' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Security', to: '/security' },
  { label: 'Desktop', to: '/desktop' },
  { label: 'FAQ', to: '/#faq', hash: 'faq' },
  { label: 'Contact', to: '/contact' },
] as const;

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  const handleNavClick = (item: (typeof NAV_ITEMS)[number], e: React.MouseEvent) => {
    setMobileMenuOpen(false);
    if ('hash' in item && item.hash) {
      e.preventDefault();
      if (pathname === '/') {
        document.getElementById(item.hash)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(`/#${item.hash}`);
      }
    }
  };

  return (
    <div className="marketing min-h-screen flex flex-col bg-[#09090B] text-zinc-100 font-sans antialiased selection:bg-zinc-700 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-[#09090B]/90 backdrop-blur-md border-b border-zinc-800">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <img
                src="/logo.jpg"
                alt="EduPulse"
                className="h-7 w-7 rounded-md object-cover"
              />
              <span className="font-semibold text-base tracking-tight text-white">
                EduPulse
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => {
                const active =
                  'hash' in item && item.hash
                    ? pathname === '/' && hash === `#${item.hash}`
                    : pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={(e) => handleNavClick(item, e)}
                    className={`text-sm font-medium transition-colors ${
                      active
                        ? 'text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                to="/start-trial"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-white text-zinc-950 text-sm font-medium hover:bg-zinc-200 transition-colors"
              >
                Start 14-day trial
              </Link>
            </div>

            <button
              className="md:hidden p-2 text-zinc-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/[0.07] py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={(e) => handleNavClick(item, e)}
                  className="block px-3 py-2.5 text-base font-medium text-zinc-300 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-3 space-y-2 border-t border-white/[0.07] mt-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2.5 text-base font-medium text-zinc-200 hover:text-white border border-white/[0.1] rounded-lg"
                >
                  Sign in
                </Link>
                <Link
                  to="/start-trial"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2.5 text-base font-medium text-zinc-950 bg-white rounded-lg hover:bg-zinc-200"
                >
                  Start 14-day trial
                </Link>
              </div>
            </div>
          )}
        </div>
        {!prefersReducedMotion && (
          <motion.div
            aria-hidden="true"
            className="h-[2px] w-full bg-gradient-to-r from-amber-400/70 via-white/80 to-sky-400/70 origin-left"
            style={{ scaleX }}
          />
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/[0.07] bg-[#060608]">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 py-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="col-span-2 sm:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-3">
                <img
                  src="/logo.jpg"
                  alt="EduPulse"
                  className="h-7 w-7 rounded-lg object-cover"
                />
                <span className="font-semibold text-base text-white">
                  EduPulse
                </span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed">
                Institutional ERP for Indian schools and colleges.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3">
                Product
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/platform" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Platform
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/security" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
                <li>
                  <Link to="/desktop" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Windows Desktop
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#faq"
                    onClick={(e) => {
                      if (pathname === '/') {
                        e.preventDefault();
                        document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3">
                Access
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/start-trial" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Start 14-day trial
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3">
                Contact
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="mailto:contact@edupulseerp.in"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    contact@edupulseerp.in
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} EduPulse · edupulseerp.in
            </p>
            <p className="text-sm text-gray-400">
              Built for Indian educational institutions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
