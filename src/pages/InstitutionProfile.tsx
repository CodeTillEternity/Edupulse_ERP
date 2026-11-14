import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PageFrame } from '../components/ui/PageFrame';
import { useInstitutionStore, DEFAULT_INSTITUTION_PROFILE } from '../store/useInstitutionStore';
import { 
  extractDominantColors, 
  deriveThemeFromColor 
} from '../lib/colorExtractor';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Building2, 
  Upload, 
  RotateCcw, 
  Save, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Eye, 
  Sparkles,
  Palette
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../config/api';

const PRESET_PALETTES = [
  { label: 'Arya Maroon & Gold', primary: '#991b1b', secondary: '#f59e0b' },
  { label: 'Crimson & Amber', primary: '#881337', secondary: '#fbbf24' },
  { label: 'Royal Blue & Cyan', primary: '#2563eb', secondary: '#38bdf8' },
  { label: 'Deep Indigo & Violet', primary: '#4338ca', secondary: '#a855f7' },
  { label: 'Emerald & Mint', primary: '#059669', secondary: '#34d399' },
  { label: 'Amber Gold & Bronze', primary: '#d97706', secondary: '#fde047' },
  { label: 'Slate Navy & Steel', primary: '#334155', secondary: '#94a3b8' },
  { label: 'Royal Purple & Fuchsia', primary: '#7c3aed', secondary: '#f43f5e' },
];

export default function InstitutionProfile() {
  const { institution, updateInstitution, resetToDefault } = useInstitutionStore();

  const [formData, setFormData] = useState({
    name: institution.name,
    code: institution.code,
    campus: institution.campus,
    tagline: institution.tagline,
    logoUrl: institution.logoUrl,
    brandPrimary: institution.brandPrimary || '#991b1b',
    brandSecondary: institution.brandSecondary || '#f59e0b',
    brandPrimaryRgb: institution.brandPrimaryRgb || '153, 27, 27',
    brandSecondaryRgb: institution.brandSecondaryRgb || '245, 158, 11',
    bgDark: institution.bgDark || '#0f0608',
    bgDarkest: institution.bgDarkest || '#060304',
    website: institution.website,
    email: institution.email,
    phone: institution.phone,
    address: institution.address,
  });

  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Compute live preview theme reacting instantly to any color or preset choice
  const previewTheme = useMemo(() => {
    return deriveThemeFromColor(formData.brandPrimary, formData.brandSecondary);
  }, [formData.brandPrimary, formData.brandSecondary]);

  // Auto-extract color on initial mount if logo exists but primary is still default or un-extracted
  useEffect(() => {
    if (formData.logoUrl && (!formData.brandPrimary || formData.brandPrimary === DEFAULT_INSTITUTION_PROFILE.brandPrimary)) {
      extractDominantColors(formData.logoUrl).then((theme) => {
        setFormData((prev) => ({
          ...prev,
          brandPrimary: theme.primary,
          brandSecondary: theme.secondary,
          brandPrimaryRgb: theme.primaryRgb,
          brandSecondaryRgb: theme.secondaryRgb,
          bgDark: theme.bgDark,
          bgDarkest: theme.bgDarkest,
        }));
      }).catch(() => {});
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, SVG).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB.');
      return;
    }

    setExtracting(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      try {
        const theme = await extractDominantColors(result);
        setFormData((prev) => ({
          ...prev,
          logoUrl: result,
          brandPrimary: theme.primary,
          brandSecondary: theme.secondary,
          brandPrimaryRgb: theme.primaryRgb,
          brandSecondaryRgb: theme.secondaryRgb,
          bgDark: theme.bgDark,
          bgDarkest: theme.bgDarkest,
        }));
        toast.success(`Logo loaded! Detected authentic palette (${theme.primary} & ${theme.secondary}). Click Save to apply.`);
      } catch (err) {
        setFormData((prev) => ({ ...prev, logoUrl: result }));
        toast.success('Custom logo loaded! Click Save to apply.');
      } finally {
        setExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReanalyzeLogoColors = async () => {
    if (!formData.logoUrl) {
      toast.error('Please upload an institutional logo first.');
      return;
    }
    setExtracting(true);
    try {
      const theme = await extractDominantColors(formData.logoUrl);
      setFormData((prev) => ({
        ...prev,
        brandPrimary: theme.primary,
        brandSecondary: theme.secondary,
        brandPrimaryRgb: theme.primaryRgb,
        brandSecondaryRgb: theme.secondaryRgb,
        bgDark: theme.bgDark,
        bgDarkest: theme.bgDarkest,
      }));
      toast.success(`Extracted palette: ${theme.primary} & ${theme.secondary}. Click Save to apply.`);
    } catch {
      toast.error('Failed to extract colors from image.');
    } finally {
      setExtracting(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_PALETTES[0]) => {
    const theme = deriveThemeFromColor(preset.primary, preset.secondary);
    setFormData((prev) => ({
      ...prev,
      brandPrimary: theme.primary,
      brandSecondary: theme.secondary,
      brandPrimaryRgb: theme.primaryRgb,
      brandSecondaryRgb: theme.secondaryRgb,
      bgDark: theme.bgDark,
      bgDarkest: theme.bgDarkest,
    }));
    toast.info(`Selected theme palette: ${preset.label}`);
  };

  const handleCustomPrimaryChange = (hex: string) => {
    const theme = deriveThemeFromColor(hex, formData.brandSecondary);
    setFormData((prev) => ({
      ...prev,
      brandPrimary: hex,
      brandPrimaryRgb: theme.primaryRgb,
      bgDark: theme.bgDark,
      bgDarkest: theme.bgDarkest,
    }));
  };

  const handleCustomSecondaryChange = (hex: string) => {
    const theme = deriveThemeFromColor(formData.brandPrimary, hex);
    setFormData((prev) => ({
      ...prev,
      brandSecondary: hex,
      brandSecondaryRgb: theme.secondaryRgb,
    }));
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logoUrl: null,
      brandPrimary: DEFAULT_INSTITUTION_PROFILE.brandPrimary,
      brandSecondary: DEFAULT_INSTITUTION_PROFILE.brandSecondary,
      brandPrimaryRgb: DEFAULT_INSTITUTION_PROFILE.brandPrimaryRgb,
      brandSecondaryRgb: DEFAULT_INSTITUTION_PROFILE.brandSecondaryRgb,
      bgDark: DEFAULT_INSTITUTION_PROFILE.bgDark,
      bgDarkest: DEFAULT_INSTITUTION_PROFILE.bgDarkest,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Logo cleared (reverted to default crest and palette).');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Update local reactive store & desktop persistence
      updateInstitution(formData);

      // 2. Try syncing with backend institutions table if available
      try {
        await apiClient.put('/api/v1/institutions/1', {
          name: formData.name,
          code: formData.code,
        }).catch(async () => {
          await apiClient.post('/api/v1/institutions', {
            name: formData.name,
            code: formData.code,
          }).catch(() => {});
        });
      } catch {
        // Backend sync is optional / non-blocking
      }

      toast.success('Institution profile, logo, and brand theme gradient updated!');
    } catch (err: any) {
      toast.error('Failed to update institution profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    resetToDefault();
    setFormData({
      name: 'Central University System',
      code: 'CUS-01',
      campus: 'Main Campus • Institutional Node 01',
      tagline: 'Unified Institutional Management Platform',
      logoUrl: null,
      brandPrimary: DEFAULT_INSTITUTION_PROFILE.brandPrimary,
      brandSecondary: DEFAULT_INSTITUTION_PROFILE.brandSecondary,
      brandPrimaryRgb: DEFAULT_INSTITUTION_PROFILE.brandPrimaryRgb,
      brandSecondaryRgb: DEFAULT_INSTITUTION_PROFILE.brandSecondaryRgb,
      bgDark: DEFAULT_INSTITUTION_PROFILE.bgDark,
      bgDarkest: DEFAULT_INSTITUTION_PROFILE.bgDarkest,
      website: 'https://university.edu',
      email: 'admin@centraluniversity.edu',
      phone: '+1 (555) 234-5678',
      address: '100 University Boulevard, Academic Quad, Building A',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Reset institution profile to defaults.');
  };

  return (
    <PageFrame
      title="Institution Profile & Personalized Branding"
      description="Customize your institution's name, campus node, logo crest, and dynamic brand gradient across the desktop application."
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Configuration Form                                           */}
        {/* ========================================================================= */}
        <div className="xl:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Identity Card */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Institutional Identity</h3>
                  <p className="text-xs text-slate-500">Visible on the login screen, desktop windows, and system reports.</p>
                </div>
                <Building2 className="w-5 h-5 text-slate-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="inst-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Institution Full Name *
                  </Label>
                  <Input
                    id="inst-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Arya College of Engineering & I.T."
                    className="h-10 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-campus" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Campus / Node Identifier *
                  </Label>
                  <Input
                    id="inst-campus"
                    value={formData.campus}
                    onChange={(e) => handleInputChange('campus', e.target.value)}
                    placeholder="e.g., Old Campus • Node 01"
                    className="h-10 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-code" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Institution Code / Acronym *
                  </Label>
                  <Input
                    id="inst-code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    placeholder="e.g., ACEIT-01"
                    className="h-10 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="inst-tagline" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tagline / Subtitle
                  </Label>
                  <Input
                    id="inst-tagline"
                    value={formData.tagline}
                    onChange={(e) => handleInputChange('tagline', e.target.value)}
                    placeholder="e.g., Unified Institutional Management Platform"
                    className="h-10 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Logo & Crest Card */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Institution Logo & Crest</h3>
                  <p className="text-xs text-slate-500">Upload your university's official crest or logo emblem.</p>
                </div>
                <Sparkles className="w-5 h-5 text-slate-400" />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Logo Display Box */}
                <div 
                  className="w-28 h-28 rounded-2xl bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-md p-2 transition-all"
                  style={{
                    boxShadow: previewTheme.boxShadowStyle,
                    border: `2px solid rgba(${previewTheme.secondaryRgb}, 0.5)`
                  }}
                >
                  {formData.logoUrl ? (
                    <img 
                      src={formData.logoUrl} 
                      alt="Institution Logo Preview" 
                      className="w-full h-full object-contain" 
                    />
                  ) : (
                    <Building2 className="w-12 h-12 text-blue-500 stroke-[1.5]" />
                  )}
                </div>

                {/* Upload Buttons & Notes */}
                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                      id="logo-upload-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={extracting}
                      className="cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {extracting ? 'Detecting Palette...' : 'Upload Custom Logo'}
                    </Button>

                    {formData.logoUrl && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleReanalyzeLogoColors}
                          disabled={extracting}
                          className="cursor-pointer text-slate-700"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                          Re-detect Palette
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveLogo}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                        >
                          Remove Logo
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Supports PNG, JPG, or SVG up to 2MB. Color palettes and atmospheric gradients are automatically extracted!
                  </p>
                </div>
              </div>
            </div>

            {/* Brand Colors & Gradient Atmosphere Card */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Personalized Atmosphere & Brand Gradient</h3>
                  <p className="text-xs text-slate-500">
                    Matches the sign-in background gradient and ambient glow to your institution's authentic color scheme.
                  </p>
                </div>
                <Palette className="w-5 h-5 text-slate-400" />
              </div>

              {/* Swatch Selector */}
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
                    Preset Institutional Palettes
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {PRESET_PALETTES.map((preset) => {
                      const isSelected = formData.brandPrimary.toLowerCase() === preset.primary.toLowerCase();
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`flex items-center space-x-2.5 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10 font-bold' 
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex -space-x-1 shrink-0">
                            <span 
                              className="w-4 h-4 rounded-full shadow-sm border border-black/10 flex items-center justify-center text-white z-10"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <span 
                              className="w-4 h-4 rounded-full shadow-sm border border-black/10"
                              style={{ backgroundColor: preset.secondary }}
                            />
                          </div>
                          <span className="text-xs text-slate-700 truncate">{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Input */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      id="custom-primary-picker"
                      value={formData.brandPrimary}
                      onChange={(e) => handleCustomPrimaryChange(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-slate-300 p-0.5 cursor-pointer"
                    />
                    <div>
                      <Label htmlFor="custom-primary-picker" className="text-xs font-bold text-slate-800 cursor-pointer block">
                        Primary Brand Color
                      </Label>
                      <Input
                        value={formData.brandPrimary}
                        onChange={(e) => handleCustomPrimaryChange(e.target.value)}
                        placeholder="#991b1b"
                        className="w-24 font-mono text-xs uppercase h-7 mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      id="custom-secondary-picker"
                      value={formData.brandSecondary}
                      onChange={(e) => handleCustomSecondaryChange(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-slate-300 p-0.5 cursor-pointer"
                    />
                    <div>
                      <Label htmlFor="custom-secondary-picker" className="text-xs font-bold text-slate-800 cursor-pointer block">
                        Secondary Accent Color
                      </Label>
                      <Input
                        value={formData.brandSecondary}
                        onChange={(e) => handleCustomSecondaryChange(e.target.value)}
                        placeholder="#f59e0b"
                        className="w-24 font-mono text-xs uppercase h-7 mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Contact & Location Card */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Official Contact & Campus Location</h3>
                  <p className="text-xs text-slate-500">Official institutional contact channels and physical address.</p>
                </div>
                <MapPin className="w-5 h-5 text-slate-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="inst-email" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400 inline mr-1" />
                    Support Email
                  </Label>
                  <Input
                    id="inst-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="admin@university.edu"
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inst-phone" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400 inline mr-1" />
                    Phone Number
                  </Label>
                  <Input
                    id="inst-phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="inst-website" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                    <Globe className="w-3.5 h-3.5 text-slate-400 inline mr-1" />
                    Official Website
                  </Label>
                  <Input
                    id="inst-website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://university.edu"
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="inst-address" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 inline mr-1" />
                    Physical Campus Address
                  </Label>
                  <Input
                    id="inst-address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="100 University Boulevard, Academic Quad, Building A"
                    className="h-10 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Defaults
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 h-11 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Institution Profile'}
              </Button>
            </div>
          </form>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Live Branding Previews                                      */}
        {/* ========================================================================= */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Card: Live Login Screen Preview */}
          <div className="bg-slate-950 text-white border border-slate-800 shadow-xl rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Live Login Atmosphere Preview
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: previewTheme.primary }} />
                <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: previewTheme.secondary }} />
              </div>
            </div>

            {/* Preview Canvas with Dynamic Radial Gradient matching Login Screen */}
            <div 
              className="rounded-xl p-8 border flex flex-col items-center text-center my-2 relative overflow-hidden transition-all duration-700"
              style={{
                background: previewTheme.gradientStyle,
                borderColor: `rgba(${previewTheme.primaryRgb}, 0.25)`
              }}
            >
              {/* Dynamic primary ambient backlight blur glow */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-all duration-700"
                style={{
                  background: previewTheme.haloGlowStyle
                }}
              />

              {/* Dynamic secondary luminous aura */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-all duration-700"
                style={{
                  backgroundColor: `rgba(${previewTheme.secondaryRgb}, 0.35)`
                }}
              />

              {/* Crest Preview - Clean White Card Container matching Login Screen */}
              <div 
                className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center mb-5 overflow-hidden p-2 relative z-10 transition-transform duration-300 hover:scale-105"
                style={{
                  boxShadow: previewTheme.boxShadowStyle,
                  border: `2px solid rgba(${previewTheme.secondaryRgb}, 0.5)`
                }}
              >
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt={formData.name} className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-12 h-12 text-blue-600 stroke-[1.5]" />
                )}
              </div>

              {/* Institution Name */}
              <h4 className="text-2xl font-black tracking-tight text-white mb-1.5 max-w-xs leading-snug relative z-10 drop-shadow-md">
                {formData.name || 'Central University System'}
              </h4>

              {/* Campus Node */}
              <p className="text-xs font-semibold text-white/80 max-w-xs relative z-10 drop-shadow-sm">
                {formData.campus || 'Main Campus • Institutional Node 01'}
              </p>

              {/* Code Pill with Brand Highlight */}
              <div 
                className="mt-4 px-3 py-1 rounded-full border text-[11px] font-bold text-white relative z-10"
                style={{
                  backgroundColor: `rgba(${previewTheme.primaryRgb}, 0.25)`,
                  borderColor: `rgba(${previewTheme.secondaryRgb}, 0.5)`
                }}
              >
                Node Code: {formData.code || 'CUS-01'}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-3">
              This preview reflects the left-hand branding panel of your desktop sign-in screen in real time.
            </p>
          </div>

          {/* Card: Institutional Overview Summary */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              System Configuration Summary
            </h4>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Institution:</span>
                <span className="font-bold text-slate-900">{formData.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Node Identifier:</span>
                <span className="font-semibold text-slate-800">{formData.campus}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Institutional Code:</span>
                <span className="font-mono font-semibold text-slate-800">{formData.code}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Brand Palette:</span>
                <span className="flex items-center space-x-2 font-mono font-bold text-slate-800">
                  <span className="flex items-center space-x-1">
                    <span className="w-3 h-3 rounded-full border border-black/10 inline-block" style={{ backgroundColor: previewTheme.primary }} />
                    <span>{previewTheme.primary}</span>
                  </span>
                  <span className="text-slate-300">/</span>
                  <span className="flex items-center space-x-1">
                    <span className="w-3 h-3 rounded-full border border-black/10 inline-block" style={{ backgroundColor: previewTheme.secondary }} />
                    <span>{previewTheme.secondary}</span>
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Official Email:</span>
                <span className="font-semibold text-slate-800">{formData.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500">Website:</span>
                <span className="font-semibold text-blue-600 truncate max-w-[200px]">{formData.website}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </PageFrame>
  );
}
