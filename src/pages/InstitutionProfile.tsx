import React, { useState, useRef } from 'react';
import { PageFrame } from '../components/ui/PageFrame';
import { useInstitutionStore } from '../store/useInstitutionStore';
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
  Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../config/api';

export default function InstitutionProfile() {
  const { institution, updateInstitution, resetToDefault } = useInstitutionStore();

  const [formData, setFormData] = useState({
    name: institution.name,
    code: institution.code,
    campus: institution.campus,
    tagline: institution.tagline,
    logoUrl: institution.logoUrl,
    website: institution.website,
    email: institution.email,
    phone: institution.phone,
    address: institution.address,
  });

  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({ ...prev, logoUrl: result }));
      toast.success('Custom logo loaded! Click Save to apply.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logoUrl: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Logo cleared (using default institutional crest).');
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
          // If ID 1 does not exist yet, try creating it
          await apiClient.post('/api/v1/institutions', {
            name: formData.name,
            code: formData.code,
          }).catch(() => {});
        });
      } catch {
        // Backend sync is optional / non-blocking
      }

      toast.success('Institution profile and desktop branding updated!');
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
      title="Institution Profile & Branding"
      description="Customize your institution's name, campus node, logo, crest, and official contact details across the desktop application."
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
                    placeholder="e.g., Central University System"
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
                    placeholder="e.g., Main Campus • Institutional Node 01"
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
                    placeholder="e.g., CUS-01"
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
                <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  {formData.logoUrl ? (
                    <img 
                      src={formData.logoUrl} 
                      alt="Institution Logo Preview" 
                      className="w-full h-full object-contain p-2" 
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
                      className="cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Custom Logo
                    </Button>

                    {formData.logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveLogo}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                      >
                        Remove Logo
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Supports PNG, JPG, or SVG up to 2MB. A square transparent PNG works best.
                  </p>
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
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Live Login Screen Branding Preview
                </span>
              </div>
              <span className="text-[10px] bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-full font-semibold">
                Client Tenant View
              </span>
            </div>

            {/* Preview Canvas */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-xl p-8 border border-slate-800/80 flex flex-col items-center text-center my-2 relative">
              {/* Crest Preview */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600/20 via-indigo-600/30 to-purple-600/20 border border-slate-700/80 shadow-2xl flex items-center justify-center mb-5 backdrop-blur-md ring-1 ring-white/10 overflow-hidden p-2">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt={formData.name} className="w-full h-full object-contain rounded-xl" />
                ) : (
                  <Building2 className="w-12 h-12 text-blue-400 stroke-[1.5]" />
                )}
              </div>

              {/* Institution Name */}
              <h4 className="text-2xl font-black tracking-tight text-white mb-1.5 max-w-xs leading-snug">
                {formData.name || 'Central University System'}
              </h4>

              {/* Campus Node */}
              <p className="text-xs font-semibold text-slate-400 max-w-xs">
                {formData.campus || 'Main Campus • Institutional Node 01'}
              </p>

              {/* Code Pill */}
              <div className="mt-4 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] font-bold text-slate-300">
                Node Code: {formData.code || 'CUS-01'}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-3">
              This preview matches the left-hand panel of your desktop sign-in screen.
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
