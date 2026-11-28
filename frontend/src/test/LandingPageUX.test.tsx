import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LandingPage Public Marketing Website', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the hero headline and primary CTAs', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(
      screen.getByRole('heading', { level: 1 })
    ).toHaveTextContent(/Run your institution with one connected system\./i);

    expect(
      screen.getByText(
        /EduPulse brings admissions, academics, examinations, finance, and campus operations into a single platform/i
      )
    ).toBeInTheDocument();

    // Primary CTAs
    const trialLinks = screen.getAllByRole('link', { name: /Start 14-day trial/i });
    expect(trialLinks.length).toBeGreaterThan(0);

    const signInLinks = screen.getAllByRole('link', { name: /Sign in/i });
    expect(signInLinks.length).toBeGreaterThan(0);
  });

  it('renders all 6 platform capability cards', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Student lifecycle')).toBeInTheDocument();
    expect(screen.getByText('Academic management')).toBeInTheDocument();
    expect(screen.getByText('Examinations & GPA')).toBeInTheDocument();
    expect(screen.getByText('Finance & fees')).toBeInTheDocument();
    expect(screen.getByText('Attendance operations')).toBeInTheDocument();
    expect(screen.getByText('Campus administration')).toBeInTheDocument();
  });

  it('renders the institutional lifecycle steps', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText('The complete institutional lifecycle')).toBeInTheDocument();
    expect(screen.getByText('Admissions')).toBeInTheDocument();
    expect(screen.getByText('Enrollment')).toBeInTheDocument();
    expect(screen.getByText('Academics')).toBeInTheDocument();
    expect(screen.getByText('Assessment')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Administration')).toBeInTheDocument();
  });

  it('renders the product showcase with interactive tabs', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/See the work behind the interface/i)).toBeInTheDocument();

    // Verify tab buttons exist
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(5);

    // Click Student directory tab
    const studentTab = screen.getByRole('tab', { name: /Student directory/i });
    fireEvent.click(studentTab);
    expect(studentTab).toHaveAttribute('aria-selected', 'true');

    // Click Finance tab
    const financeTab = screen.getByRole('tab', { name: /Finance & billing/i });
    fireEvent.click(financeTab);
    expect(financeTab).toHaveAttribute('aria-selected', 'true');
  });

  it('renders genuine screenshot images with alt text', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    const images = screen.getAllByRole('img');
    // Should have at least: hero screenshot, role showcase screenshots, logo images
    expect(images.length).toBeGreaterThan(2);

    // Hero screenshot references genuine product
    const heroImg = images.find((img) =>
      img.getAttribute('src')?.includes('/screenshots/erp-dashboard.png')
    );
    expect(heroImg).toBeDefined();
    expect(heroImg?.getAttribute('alt')).toBeTruthy();
  });

  it('renders pricing section with 3 tiers and no invented INR amounts', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Transparent institutional pricing')).toBeInTheDocument();
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
    expect(screen.getByText('Most popular')).toBeInTheDocument();

    // No invented rupee amounts should appear
    const container = document.body.textContent || '';
    expect(container).not.toMatch(/₹\d+,\d+/);
  });

  it('renders FAQ section with expandable questions', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Frequently asked questions')).toBeInTheDocument();
    expect(screen.getByText('What is EduPulse?')).toBeInTheDocument();
    expect(screen.getByText('How long is the free trial?')).toBeInTheDocument();

    // Click to expand
    const faqBtn = screen.getByText('How long is the free trial?');
    fireEvent.click(faqBtn);
    expect(
      screen.getAllByText(/14-day full-featured trial/i).length
    ).toBeGreaterThanOrEqual(2);
  });

  it('renders trust and architecture section', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Built for institutional trust')).toBeInTheDocument();
    expect(screen.getByText('Tenant isolation')).toBeInTheDocument();
    expect(screen.getByText('Built for India')).toBeInTheDocument();
  });

  it('renders footer with edupulseerp.in branding', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getAllByText(/edupulseerp\.in/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Built for Indian educational institutions/i)).toBeInTheDocument();
  });

  it('renders role-based experience sections', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Built for every role in your institution')).toBeInTheDocument();
    expect(screen.getByText('Management & Registrar')).toBeInTheDocument();
    expect(screen.getByText('Faculty')).toBeInTheDocument();
    expect(screen.getByText('Complete institutional visibility')).toBeInTheDocument();
    expect(screen.getByText('Focused academic tools')).toBeInTheDocument();
  });

  it('renders dedicated animated integration sections for live class, maps, notion, and razorpay', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(
      screen.getByText('One timetable. Every live classroom.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Live vehicle routing from gate to doorstep.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Every lecture turns into structured Notion notes.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Collect fees in seconds. Reconcile ledgers automatically.')
    ).toBeInTheDocument();

    // Interactive live classroom provider switcher
    const zoomBtn = screen.getByRole('button', { name: 'Zoom' });
    fireEvent.click(zoomBtn);
    expect(zoomBtn).toHaveAttribute('aria-pressed', 'true');

    const jitsiBtn = screen.getByRole('button', { name: 'Jitsi Meet' });
    fireEvent.click(jitsiBtn);
    expect(jitsiBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
